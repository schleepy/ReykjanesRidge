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
    restrictedLabels,
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
            restrictedLabels: restrictedLabels,
            tooltipConfig: {
                position: 'bottom center',
                variation: 'tiny visible ' + color
            },
            onChange: function (range, firstVal, secondVal) {
                dotNetRef.invokeMethodAsync('valueChanged', range, firstVal, secondVal);
            }
        });
}

window.fomRangeSlider = {
    init: (dotNetRef, id, min, max, start, end, step, smooth, showThumbTooltip, color, restrictedLabels) => { fomRangeSliderInit(dotNetRef, id, min, max, start, end, step, smooth, showThumbTooltip, color, restrictedLabels) },
};