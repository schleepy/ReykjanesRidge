function fomRangeSliderInit(
    dotNetRef,
    id,
    min,
    max,
    start,
    end,
    step,
    smooth,
    showThumbTooltip,
    color,
) {
    $('#' + id)
        .slider({
            min: min,
            max: max,
            start: start,
            end: end,
            step: step,
            smooth: smooth,
            showThumbTooltip: showThumbTooltip,
            tooltipConfig: {
                position: 'top center',
                variation: 'small visible ' + color
            },
            onChange: function (range, firstVal, secondVal) {
                dotNetRef.invokeMethodAsync('valueChanged', range, firstVal, secondVal);
            }
        });
}

window.fomRangeSlider = {
    init: (dotNetRef, id, min, max, start, end, step, smooth, showThumbTooltip, color) => { fomRangeSliderInit(dotNetRef, id, min, max, start, end, step, smooth, showThumbTooltip, color) },
};