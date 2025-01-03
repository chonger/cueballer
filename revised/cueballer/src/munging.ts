
enum EventType {
    LINE,
    STAGE_DIRECTION,
}

interface SceneEvent {
    eventType: EventType
    actors: Set<string>
    text: string
}

interface Scene {
    location?: string,
    sceneName?: string,
    content: SceneEvent[]
}

export interface ParsedScript {
    title?: string
    scenes: Scene[]
    allActors: Set<string>
}

export function parseScript(formattedScript: string): ParsedScript {

    const parsedScript: ParsedScript = { scenes: [], allActors: new Set() }

    let currentScene: Scene = { content: [] }

    for (let line of formattedScript.split("\n")) {

        /**
         * 
         * SECTION 1 : single line items 
         * 
         * T: Title
         * NS: Scene Title
         * SL: Scene Location
         * SD: Stage Direction
         * 
         * All are all required to be on a single line
         * 
         * Of these, only Stage Directions are SceneEvents, and the actors associated with them
         * are any that are listed in their text in all caps - these will be detected once all actors 
         * have been collected in the parsing process.
         * 
         */

        if (line.indexOf("T:") === 0) {
            parsedScript['title'] = line.slice(2).trim();
            continue;
        }

        if (line.indexOf("NS:") === 0) {
            const newScene = {
                sceneName: line.slice(3),
                content: []
            }
            currentScene = newScene;
            parsedScript['scenes'].push(currentScene);
            continue;
        }

        if (line.indexOf("SL:") === 0) {
            currentScene['location'] = line.slice(3)
            continue;
        }

        if (line.indexOf("SD:") === 0) {
            currentScene['content'].push({
                eventType: EventType.STAGE_DIRECTION,
                actors: new Set<string>(), // The actors associated with this SD will be assigned later
                text: line.slice(3).trim()
            })
            continue;
        }

        /**
         * SECTION 2 - Spoken Lines
         * 
         * Any line containing only uppercase text taken to kick off a new spoken line.
         * 
         * The actor names are comma separated
         * 
         * Any line not containing uppercase text is assumed to be a continuation of the previous line.
         * 
         * Empty lines are retained for now, and handled during cleanup
         */

        if (line.length > 0 && line.toUpperCase() === line) {
            const actorNames = line.trim().split(',').map(x => x.trim())

            currentScene['content'].push({
                eventType: EventType.LINE,
                actors: new Set(actorNames),
                text: ''
            })
            continue;
        }

        // If no special case has been triggered and there is some line, simply append the text, preserving the newline.
        if (currentScene.content.length > 0)
            currentScene['content'].slice(-1)[0].text += "\n" + line
    }

    // assign allActors for the full script
    parsedScript.scenes.forEach(s => s.content.forEach(c => c.actors.forEach(a => parsedScript.allActors.add(a))))

    // assign actors to stage directions
    parsedScript.scenes.forEach(s => s.content.filter(c => c.eventType === EventType.STAGE_DIRECTION).forEach(c => {
        c.actors = new Set(Array.from(parsedScript.allActors).filter(a => c.text.indexOf(a) >= 0))
    }))

    // trim whitespace at the end or beginning of lines (but not inside a line)
    parsedScript.scenes.forEach(s => s.content.filter(c => c.eventType === EventType.LINE).forEach(l => {
        l.text = l.text.trim()
    }))

    console.log(parsedScript)
    return parsedScript
}

export function createCueScript(parsedScript: ParsedScript,
    actors: Set<string>,
    nWordsInCueScript: number,
    nLettersInLine: number) : string {

    const rightJustify = (s) => {
        return `${new Array(nLettersInLine - s.length).fill('-').join('')}${s}`
    }

    const centerJustify = (s) => {
        const len = Math.floor((nLettersInLine - s.length) / 2)
        if (len < 0)
            return s
        const spacer = new Array(len).fill(' ').join('')
        const optionalSpacer = spacer.length % 2 === 0 ? '' : ' '
        return `${spacer}${s}${spacer}${optionalSpacer}`
    }

    const makeCue = (c) => rightJustify(c.text.trim().split(' ').slice(-nWordsInCueScript).join(' ').replaceAll("\n", ' ').replaceAll("\r", ' '))

    const lineHasActiveActors = (c: SceneEvent) => c.actors.intersection(actors).size > 0

    let cscript = ""

    if (parsedScript.title)
        cscript += centerJustify(parsedScript['title'] + " - " + Array.from(actors).join(" / ")) + "\n\n"
    else
        cscript += centerJustify(Array.from(actors).join(" / ")) + "\n\n"

    let sceneIdx = 0
    for (let scene of parsedScript.scenes) {
        sceneIdx += 1

        let hasLine = false
        for (let c of scene.content) {
            if (c.eventType === EventType.LINE && lineHasActiveActors(c)) {
                hasLine = true
            }
        }
        if (!hasLine) {
            continue
        }

        if (scene.sceneName)
            cscript += "\n" + centerJustify(scene.sceneName.trim()) + "\n\n"
        else
            cscript += "\n" + centerJustify(`Scene ${sceneIdx}`) + "\n\n"

        /**
         * The Rules: 
         * 
         * A cue is added if the actor is active in a stage direction OR a line
         * 
         * A cue will always be a line, except in the case of the start of the scene, in which case it is omitted (the scene header serves as the cue in this case)
         * 
         * All SD's between the cue and the active line will be included, regardless of who is involved
         * 
         * All SD's inside a continued line are included
         * 
         * All SD's from the end of a line are included up until the point that the active actor has no more SDs 
         * 
         */

        for (let idx = 0; idx < scene.content.length; ++idx) {
            const c = scene.content[idx] as any
            c.isActive = lineHasActiveActors(c)
            if (c.isActive) {
                // mark all preceding SD's as active
                for (let jdx = idx - 1; jdx >= 0; --jdx) {
                    const x = scene.content[jdx] as any
                    if (!x.isActive && x.eventType === EventType.STAGE_DIRECTION) {
                        x.isActive = true
                    } else {
                        break
                    }
                }
            }
        }

        let idx = 0
        while (idx < scene.content.length) {
            let cur = scene.content[idx] as any
            if (cur.isActive) {
                const cue = idx === 0 ? "" : makeCue(scene.content[idx - 1])
                let line = ""
                while (idx < scene.content.length && cur.isActive) {
                    if (cur.eventType === EventType.LINE) {
                        line += cur.text.trim() + "\n"
                    } else {
                        line += centerJustify(`[${cur.text.trim()}]`) + "\n"
                    }
                    idx += 1
                    cur = scene.content[idx] as any
                }

                cscript += cue.trim() + '\n' + line // commit final line
            } else {
                idx += 1
            }
        }
    }

    return cscript
}