function fomRangeSliderInit(
    dotNetRef,
    id,
    min,
    max,
    start,
    end,
    step,
    smooth
) {
    $('#' + id)
        .slider({
            min: min,
            max: max,
            start: start,
            end: end,
            step: step,
            smooth: smooth,
            onChange: function (range, firstVal, secondVal) {
                dotNetRef.invokeMethodAsync('valueChanged', range, firstVal, secondVal);
            }
        });
}

window.fomRangeSlider = {
    init: (dotNetRef, id, min, max, start, end, step, smooth) => { fomRangeSliderInit(dotNetRef, id, min, max, start, end, step, smooth) },
};