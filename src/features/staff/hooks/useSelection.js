import { useState, useCallback } from "react";

/**
 * Manages checkbox selection state for a list of IDs.
 * Returns: { selected, toggle, toggleAll, clearAll, isSelected, isAllSelected }
 */
export default function useSelection() {
    const [selected, setSelected] = useState([]);

    const toggle = useCallback((id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const toggleAll = useCallback((ids) => {
        setSelected((prev) =>
            prev.length === ids.length && ids.every((id) => prev.includes(id))
                ? []
                : [...ids]
        );
    }, []);

    const clearAll = useCallback(() => setSelected([]), []);

    const isSelected = useCallback((id) => selected.includes(id), [selected]);

    const isAllSelected = useCallback(
        (ids) => ids.length > 0 && ids.every((id) => selected.includes(id)),
        [selected]
    );

    return { selected, toggle, toggleAll, clearAll, isSelected, isAllSelected };
}
