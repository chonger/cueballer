export const wrapMultiline = (s : string, nLettersInLine: number) : string => {
    return s.split('\n').map(x => wrap(x, true, nLettersInLine)).join('\n')        
}

const PAD : string = '   '

export const wrap = (s : string, leading: boolean, nLettersInLine: number) : string => {
    const maxLength = leading ? nLettersInLine : nLettersInLine - PAD.length
    if(s.length <= maxLength)
        return leading ? s : PAD + s
    const words = s.split(' ')
    let i = 0
    let runningLength = 0
    for(;i<words.length && runningLength <= maxLength;++i) {
        runningLength += words[i].length + (i > 0 ? 1 : 0)
    }
    // this shouldn't happen unless nLettersInLine is very small, which the UI does not allow
    // but without it there is a chance of infinite loop
    if(i <= 1) 
        return leading ? s : PAD + s
    const sliceLength = words.slice(0, i-1).join(' ').length
    return `${leading ? '' : PAD}${s.slice(0, sliceLength)}\n${wrap(s.slice(sliceLength).trim(), false, nLettersInLine)}`
}

export const centerJustify = (s, nLettersInLine) => {
    const len = Math.floor((nLettersInLine - s.length) / 2)
    if (len < 0)
        return wrap(s, true, nLettersInLine)
    const spacer = new Array(len).fill(' ').join('')
    const optionalSpacer = spacer.length % 2 === 0 ? '' : ' '
    return `${spacer}${s}${spacer}${optionalSpacer}`
}