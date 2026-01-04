import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

interface ChartProps {
  type: 'bar' | 'doughnut' | 'line'
  data: any
  options?: any
  title?: string
  height?: number
}

const CustomChart = ({ type, data, options, title, height = 300 }: ChartProps) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    ...(type === 'line' && {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
    }),
    ...(type === 'bar' && {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }),
    ...options,
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={defaultOptions} height={height} />
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} height={height} />
      case 'line':
        return <Line data={data} options={defaultOptions} height={height} />
      default:
        return <Bar data={data} options={defaultOptions} height={height} />
    }
  }

  return (
    <div style={{ height, width: '100%' }}>
      {renderChart()}
    </div>
  )
}

export default CustomChart