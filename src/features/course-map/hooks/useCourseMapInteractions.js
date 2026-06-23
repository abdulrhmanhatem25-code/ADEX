import { useState, useCallback, useMemo, useRef } from "react";

/**
 * Manages all hover, focus, and prerequisite highlight interactions
 * for the Course Map.
 */
export function useCourseMapInteractions(prereqMap) {
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [focusedCourse, setFocusedCourse] = useState(null);

  // DOM ref for course card nodes (used by ConnectionsLayer)
  const nodesRef = useRef({});

  const registerRef = useCallback((id, node) => {
    if (node) {
      nodesRef.current[id] = node;
    } else {
      delete nodesRef.current[id];
    }
  }, []);

  // ─── Graph traversal ────────────────────────────────────────────────────────
  const getRelatedCourses = useCallback((targetCode) => {
    if (!targetCode) return new Set();

    const related = new Set();
    related.add(targetCode);

    const findPrereqs = (code) => {
      const pre = prereqMap[code] || [];
      pre.forEach(p => {
        if (!related.has(p)) {
          related.add(p);
          findPrereqs(p);
        }
      });
    };

    findPrereqs(targetCode);
    return related;
  }, [prereqMap]);

  const relatedCourses = useMemo(() => {
    const activeCode = focusedCourse || hoveredCourse;
    return getRelatedCourses(activeCode);
  }, [focusedCourse, hoveredCourse, getRelatedCourses]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback((id, code) => {
    if (!focusedCourse) setHoveredCourse(code);
  }, [focusedCourse]);

  const handleMouseLeave = useCallback(() => {
    if (!focusedCourse) setHoveredCourse(null);
  }, [focusedCourse]);

  const handleClick = useCallback((id, code) => {
    if (focusedCourse === code) {
      setFocusedCourse(null);
      setHoveredCourse(code);
    } else {
      setFocusedCourse(code);
    }
  }, [focusedCourse]);

  const clearFocus = useCallback(() => {
    setFocusedCourse(null);
  }, []);

  return {
    hoveredCourse,
    focusedCourse,
    relatedCourses,
    nodesRef,
    registerRef,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    clearFocus,
  };
}
