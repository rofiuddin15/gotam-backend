import React from 'react';
import { flexRender } from '@tanstack/react-table';

const Table = ({ tableInstance, className = '' }) => {
    return (
        <table className={`w-full text-left border-collapse ${className}`}>
            <thead>
                {tableInstance.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className="px-4 py-2 font-bold">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody className="text-[13px] divide-y divide-outline-variant/10">
                {tableInstance.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-1.5">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
