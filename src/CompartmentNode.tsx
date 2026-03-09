import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const CompartmentNode = memo(({ data }: any) => {
    return (
        <div className="w-full h-full relative">
            {/* Label Badge */}
            <div
                className="absolute top-0 left-0 px-4 py-1.5 rounded-br-lg font-bold text-xs uppercase tracking-widest"
                style={{
                    backgroundColor: data.color,
                    color: '#18181b' // zinc-950
                }}
            >
                {data.label}
            </div>

            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
});
