import React, { useEffect, useState, useCallback } from "react";

function getStringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function getColorForCourse(code) {
    const hash = Math.abs(getStringHash(code));
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 45%)`;
}

export default function ConnectionsLayer({
    containerRef,
    nodesRef,
    prereqMap,
    items,
    hoveredCourse,
    focusedCourse,
    relatedCourses,
    isExporting
}) {
    const [lines, setLines] = useState([]);

    const calculateLines = useCallback(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLines = [];

        // Build a quick lookup for item by code
        const codeToId = {};
        items.forEach(item => {
            if (item.course && item.course.courseCode) {
                codeToId[item.course.courseCode] = item.id;
            }
        });

        Object.entries(prereqMap).forEach(([targetCode, prereqCodes]) => {
            const targetId = codeToId[targetCode];
            const targetNode = nodesRef.current[targetId];

            if (!targetNode) return;
            const tRect = targetNode.getBoundingClientRect();

            prereqCodes.forEach(prereqCode => {
                const sourceId = codeToId[prereqCode];
                const sourceNode = nodesRef.current[sourceId];
                if (!sourceNode) return;

                const sRect = sourceNode.getBoundingClientRect();

                const isHorizontalFlow = isExporting || Math.abs(tRect.left - sRect.left) > Math.abs(tRect.top - sRect.top);

                let sx, sy, tx, ty;

                if (isHorizontalFlow) {
                    tx = (tRect.left - containerRect.left);
                    ty = (tRect.top - containerRect.top) + (tRect.height) / 2;
                    sx = (sRect.right - containerRect.left);
                    sy = (sRect.top - containerRect.top) + (sRect.height) / 2;
                } else {
                    tx = tRect.left - containerRect.left + tRect.width / 2;
                    ty = tRect.top - containerRect.top;
                    sx = sRect.left - containerRect.left + sRect.width / 2;
                    sy = sRect.bottom - containerRect.top;
                }

                // Only show this line if there is no focus/hover, or if both nodes are involved in the highlight
                let isActive = false;
                let isFaded = false;

                const hasFocusOrHover = hoveredCourse || focusedCourse;

                if (hasFocusOrHover) {
                    const highlightCode = hoveredCourse || focusedCourse;
                    // Is this line part of the highlighted graph?
                    // highlightCode is either the source or target, or they are both in relatedCourses
                    if (
                        highlightCode === targetCode ||
                        highlightCode === prereqCode ||
                        (relatedCourses.has(targetCode) && relatedCourses.has(prereqCode))
                    ) {
                        isActive = true;
                    } else {
                        isFaded = true;
                    }
                }

                newLines.push({
                    id: `${prereqCode}-${targetCode}`,
                    sourceId,
                    targetId,
                    sx, sy, tx, ty,
                    isActive,
                    isFaded,
                    isHorizontalFlow
                });
            });
        });

        // If exporting, apply orthogonal edge spacing
        if (isExporting) {
            const sourceGroups = {};
            newLines.forEach(line => {
                (sourceGroups[line.sourceId] ??= []).push(line);
            });
            Object.values(sourceGroups).forEach(group => {
                if (group.length <= 1) return;
                group.sort((a, b) => a.tx - b.tx);
                const spacing = 12;
                group.forEach((line, idx) => {
                    const offset = (idx - (group.length - 1) / 2) * spacing;
                    if (line.isHorizontalFlow) {
                        line.sy += offset;
                    } else {
                        line.sx += offset;
                    }
                });
            });

            const targetGroups = {};
            newLines.forEach(line => {
                (targetGroups[line.targetId] ??= []).push(line);
            });
            Object.values(targetGroups).forEach(group => {
                if (group.length <= 1) return;
                group.sort((a, b) => a.sx - b.sx);
                const spacing = 12;
                group.forEach((line, idx) => {
                    const offset = (idx - (group.length - 1) / 2) * spacing;
                    if (line.isHorizontalFlow) {
                        line.ty += offset;
                    } else {
                        line.tx += offset;
                    }
                });
            });

            // Offset the middle orthogonal channels to prevent overlapping
            const channelGroups = {};
            newLines.forEach(line => {
                if (line.isHorizontalFlow) {
                    const midX = line.sx + Math.max(20, (line.tx - line.sx) / 2);
                    const bin = Math.round(midX / 20) * 20;
                    (channelGroups[bin] ??= []).push(line);
                }
            });

            Object.values(channelGroups).forEach(group => {
                if (group.length <= 1) return;
                group.sort((a, b) => a.sy - b.sy);
                const spacing = 8;
                group.forEach((line, idx) => {
                    const offset = Math.ceil(idx / 2) * spacing * (idx % 2 === 0 ? 1 : -1);
                    line.midXOffset = offset;

                    // If paths share similar y coordinates in the same channel, dash one to differentiate
                    if (idx > 0 && Math.abs(line.sy - group[idx - 1].sy) < 25) {
                        line.isDashed = true;
                    }
                });
            });
        }

        setLines(newLines);
    }, [containerRef, nodesRef, prereqMap, items, hoveredCourse, focusedCourse, relatedCourses, isExporting]);

    useEffect(() => {
        // Calculate initially
        // Delay slightly to ensure layout is done
        const timer = setTimeout(() => {
            calculateLines();
        }, 100);

        // Add resize listener
        window.addEventListener("resize", calculateLines);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", calculateLines);
        };
    }, [calculateLines]);

    // Draw path
    const getPath = (line, isExporting) => {
        const { sx, sy, tx, ty, isHorizontalFlow, midXOffset = 0 } = line;

        if (!isExporting) {
            if (isHorizontalFlow) {
                const midX = sx + Math.max(20, (tx - sx) / 2);
                return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
            } else {
                const midY = sy + Math.max(20, (ty - sy) / 2);
                return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
            }
        }

        // Orthogonal elbow routing with rounded corners for export
        const r = 8;
        if (isHorizontalFlow) {
            const midX = sx + Math.max(20, (tx - sx) / 2) + midXOffset;
            if (Math.abs(ty - sy) < 2 * r || Math.abs(tx - midX) < r || Math.abs(midX - sx) < r) {
                return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
            }
            const dY = ty > sy ? 1 : -1;
            const dX = tx > midX ? 1 : -1;
            return `M ${sx} ${sy} ` +
                   `L ${midX - dX * r} ${sy} ` +
                   `Q ${midX} ${sy} ${midX} ${sy + dY * r} ` +
                   `L ${midX} ${ty - dY * r} ` +
                   `Q ${midX} ${ty} ${midX + dX * r} ${ty} ` +
                   `L ${tx} ${ty}`;
        } else {
            const midY = sy + Math.max(20, (ty - sy) / 2);
            if (Math.abs(tx - sx) < 2 * r || Math.abs(ty - midY) < r || Math.abs(midY - sy) < r) {
                return `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`;
            }
            const dX = tx > sx ? 1 : -1;
            const dY = ty > midY ? 1 : -1;
            return `M ${sx} ${sy} ` +
                   `L ${sx} ${midY - dY * r} ` +
                   `Q ${sx} ${midY} ${sx + dX * r} ${midY} ` +
                   `L ${tx - dX * r} ${midY} ` +
                   `Q ${tx} ${midY} ${tx} ${midY + dY * r} ` +
                   `L ${tx} ${ty}`;
        }
    };

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ minHeight: "100%" }}
        >
            <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
                </marker>
                <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="var(--cmap-active-line)" />
                </marker>
            </defs>

            {lines.map(line => {
                const opacity = line.isFaded ? 0.1 : (line.isActive ? 1 : (isExporting ? 0.8 : 0.4));
                let stroke = line.isActive ? "var(--cmap-active-line)" : "#cbd5e1";
                let strokeDasharray = "none";

                if (isExporting) {
                    // Unique color per source node for readability
                    stroke = getColorForCourse(line.sourceId);
                    if (line.isDashed) {
                        strokeDasharray = "4 4";
                    }
                }

                const width = line.isActive ? 2 : 1.5;
                const marker = line.isActive ? "url(#arrowhead-active)" : "url(#arrowhead)";

                return (
                    <path
                        key={line.id}
                        d={getPath(line, isExporting)}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={width}
                        strokeDasharray={strokeDasharray}
                        opacity={opacity}
                        markerEnd={marker}
                        className="transition-all duration-300"
                    />
                );
            })}
        </svg>
    );
}
