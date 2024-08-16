"use client"

import React from 'react'
import ReactApexChart from "react-apexcharts"
import CardHeader from './cardHeader'


const AssetAllocation = () => {
  const data = {
    series: [100000000, 40000000, 60000000, 12000000, 300000000],
    options: {
      chart: {
        type: "donut",
        foreColor: "#000000"
      },
      fill : {
        colors: ["#2b5140", "#466c4f", "#699863", "#93af6c", "#ddde95"]
      },
      stroke: {
        colors: ["#000000"]
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(2) + "%"
        }
      },
      tooltip: {
        enabled: true,
        onDatasetHover: {
          highlightDataSeries: true
        },
        y: {
          formatter: function (val) {
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR"
            }).format(val)
          },
          title: {
            formatter: (seriesName) => seriesName + ":"
          }
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: "Total Assets",
                formatter: function (w) {
                  return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR"
                  }).format(w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0))
                }
              }
            }
          }
        }
      },
      labels: ["Cash and Cash Equivalents", "Account Receivable", "Equipment", "Supplies", "Prepaid Expenses"],
      legend: {
        position: "bottom"
      }
    }
  }
  return (
    <>
      <section className="mt-10 grid gap-7 grid-cols-1">
        <div className="bg-primary-green-light rounded-md p-5">
          <CardHeader title= "Assets Distribution" />
          <ReactApexChart options={data.options} series={data.series} type='donut' height={400} />
        </div>
      </section>
    </>
  )
}

export default AssetAllocation