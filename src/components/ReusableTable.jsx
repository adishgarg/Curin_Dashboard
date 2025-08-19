import React from "react"
import PropTypes from "prop-types"

export default function ReusableTable({
  columns,
  data,
  emptyText = "No records found",
  minWidth = "800px"
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }} role="table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row._id ?? rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-4 text-sm text-gray-900 ${col.className || ""}`}
                    >
                      {col.render 
                        ? col.render(row, rowIndex) 
                        : col.accessor 
                          ? String(row[col.accessor]) 
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

ReusableTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      render: PropTypes.func,
      className: PropTypes.string
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  emptyText: PropTypes.string,
  minWidth: PropTypes.string
}
