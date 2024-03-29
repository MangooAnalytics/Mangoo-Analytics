import { METRIC_LABELS, METRIC_FORMATTER } from './visitor-graph'
import { parseDate, formatMonthYYYY, formatDay } from '../../util/date'

export const dateFormatter = (interval, longForm) => {
  return function (isoDate, _index, _ticks) {
    if (!isoDate) return '';


    if (interval === 'minute') {
      if (longForm) {
        const minutesAgo = Math.abs(isoDate);
        return minutesAgo === 1 ? '1 minute ago' : minutesAgo + ' minutes ago';
      } else {
        return isoDate + 'm';
      }
    }
    else {
      const date = parseDate(isoDate);

      if (interval === 'month') {
        return formatMonthYYYY(date);
      } else if (interval === 'date') {
        return formatDay(date);
      } else if (interval === 'hour') {
        const dateFormat = Intl.DateTimeFormat(navigator.language, { hour: 'numeric' });
        const twelveHourClock = dateFormat.resolvedOptions().hour12;
        const formattedHours = dateFormat.format(date);

        if (twelveHourClock) {
          return formattedHours.replace(' ', '').toLowerCase();
        } else {
          return formattedHours.replace(/[^0-9]/g, '').concat(":00");
        }
      }
    }
  }
}

export const GraphTooltip = (graphData, metric) => {
  return (context) => {
    const tooltipModel = context.tooltip;
    const hasPrevData = graphData['prev_labels'] && graphData['prev_plot'] ? true : false;
    const offset = document.getElementById("main-graph-canvas").getBoundingClientRect();

    // Tooltip Element
    let tooltipEl = document.getElementById('chartjs-tooltip');

    // Create element on first render
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.style.display = 'none';
      tooltipEl.style.opacity = 0;
      document.body.appendChild(tooltipEl);
    }

    if (tooltipEl && offset && window.innerWidth < 768) {
      tooltipEl.style.top = offset.y + offset.height + window.scrollY + 15 + 'px'
      tooltipEl.style.left = offset.x + 'px'
      tooltipEl.style.right = null;
      tooltipEl.style.opacity = 1;
    }

    // Stop if no tooltip showing
    if (tooltipModel.opacity === 0) {
      tooltipEl.style.display = 'none';
      return;
    }

    function getBody(bodyItem) {
      return bodyItem.lines;
    }

    function renderLabel(label, prev_label) {
      const formattedLabel = dateFormatter(graphData.interval, true)(label)
      const prev_formattedLabel = prev_label && dateFormatter(graphData.interval, true)(prev_label)

      if (graphData.interval === 'month') {
        return !prev_label ? formattedLabel : prev_formattedLabel
      }

      if (graphData.interval === 'date') {
        return !prev_label ? formattedLabel : prev_formattedLabel
      }

      if (graphData.interval === 'hour') {
        return !prev_label ? `${dateFormatter("date", true)(label)}, ${formattedLabel}` : `${dateFormatter("date", true)(prev_label)}, ${dateFormatter(graphData.interval, true)(prev_label)}`
      }

      return !prev_label ? formattedLabel : prev_formattedLabel
    }


    function renderPointInfo(label, point, metric, isPrevPoint) {
      if (!label || (point !== 0 && !point)) return '';

      const backgroundColor = isPrevPoint ? 'rgba(166,187,210,0.5)' : 'rgba(101,116,205)'

      return `
      <div class='flex flex-row justify-between items-center'>
        <span class='flex items-center mr-4'>
          <div class='w-3 h-3 mr-1 rounded-full' style='background-color: ${backgroundColor}'></div>
          <span>${renderLabel(label)}</span>
        </span>
        <span class='text-base font-bold'>${METRIC_FORMATTER[metric](point)}</span>
      </div>
      `;
    }

    // function renderComparison(change) {
    //   const formattedComparison = numberFormatter(Math.abs(change))

    //   if (change > 0) {
    //     return `<span class='text-green-500 font-bold'>${formattedComparison}%</span>`
    //   }
    //   if (change < 0) {
    //     return `<span class='text-red-400 font-bold'>${formattedComparison}%</span>`
    //   }
    //   if (change === 0) {
    //     return `<span class='font-bold'>0%</span>`
    //   }
    // }

    // Set Tooltip Body
    if (tooltipModel.body) {
      var bodyLines = tooltipModel.body.map(getBody);

      // Remove duplicated line on overlap between dashed and normal
      if (bodyLines.length == 3) {
        bodyLines[1] = false
      }

      const data = tooltipModel.dataPoints[0]
      const label = !data.dataset.isPrevious ? graphData.labels[data.dataIndex] : undefined
      const point = !data.dataset.isPrevious ? data.raw || 0 : undefined

      const prevData = hasPrevData ? tooltipModel.dataPoints.slice(-1)[0] : undefined
      const prevLabel = prevData && prevData.dataset.isPrevious ? graphData.prev_labels[prevData.dataIndex] : undefined
      const prevPoint = prevData && prevData.dataset.isPrevious ? prevData.raw || 0 : undefined
      // const pct_change = point === prev_point ? 0 : prev_point === 0 ? 100 : Math.round(((point - prev_point) / prev_point * 100).toFixed(1))

      let innerHtml = `
			<div class='text-gray-100 flex flex-col'>
				<div class='flex justify-between items-center'>
						<span class='font-semibold mr-4 text-lg'>${METRIC_LABELS[metric]}</span>
				</div>
				<div class='flex flex-col'>
					${renderPointInfo(label, point, metric, false)}
					${renderPointInfo(prevLabel, prevPoint, metric, true)}
				</div>
				<span class='font-semibold italic'>${graphData.interval === 'month' ? 'Click to view month' : graphData.interval === 'date' ? 'Click to view day' : ''}</span>
			</div>
			`;

      tooltipEl.innerHTML = innerHtml;
    }
    tooltipEl.style.display = null;
  }
}

export const buildDataSet = (plot, present_index, ctx, label, isPrevious) => {
  var gradient = ctx.createLinearGradient(0, 0, 0, 300);
  var prev_gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(101,116,205, 0.2)');
  gradient.addColorStop(1, 'rgba(101,116,205, 0)');
  prev_gradient.addColorStop(0, 'rgba(101,116,205, 0.075)');
  prev_gradient.addColorStop(1, 'rgba(101,116,205, 0)');

  if (!isPrevious) {
    if (present_index) {
      var dashedPart = plot.slice(present_index - 1, present_index + 1);
      var dashedPlot = (new Array(present_index - 1)).concat(dashedPart)
      const _plot = [...plot]
      for (var i = present_index; i < _plot.length; i++) {
        _plot[i] = undefined
      }

      return [{
        label,
        data: _plot,
        borderWidth: 3,
        borderColor: 'rgba(101,116,205)',
        pointBackgroundColor: 'rgba(101,116,205)',
        pointHoverBackgroundColor: 'rgba(71, 87, 193)',
        pointBorderColor: 'transparent',
        pointHoverRadius: 4,
        backgroundColor: gradient,
        fill: true,
        isPrevious: isPrevious
      },
      {
        label,
        data: dashedPlot,
        borderWidth: 3,
        borderDash: [3, 3],
        borderColor: 'rgba(101,116,205)',
        pointHoverBackgroundColor: 'rgba(71, 87, 193)',
        pointBorderColor: 'transparent',
        pointHoverRadius: 4,
        backgroundColor: gradient,
        fill: true,
        isPrevious: isPrevious
      }]
    } else {
      return [{
        label,
        data: plot,
        borderWidth: 3,
        borderColor: 'rgba(101,116,205)',
        pointHoverBackgroundColor: 'rgba(71, 87, 193)',
        pointBorderColor: 'transparent',
        pointHoverRadius: 4,
        backgroundColor: gradient,
        fill: true,
        isPrevious: isPrevious
      }]
    }
  } else {
    return [{
      label,
      data: plot,
      borderWidth: 2,
      borderDash: [10, 1],
      borderColor: 'rgba(166,187,210,0.5)',
      pointHoverBackgroundColor: 'rgba(166,187,210,0.8)',
      pointBorderColor: 'transparent',
      pointHoverBorderColor: 'transparent',
      pointHoverRadius: 4,
      backgroundColor: prev_gradient,
      fill: true,
      isPrevious: isPrevious
    }]
  }
}
