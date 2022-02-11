define('testModule', [], () => {
    let count = 0
    const increase = () => ++count
    const reset = () => {
        count = 0
        console.log('Счетчик сброшен.')
    }

    return {
        increase,
        reset
    }
})