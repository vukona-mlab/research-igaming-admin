import React from 'react'

export const ContextMenu = ({ isUpdating, item, handleContextMenuAction }) => {
    return (
        <div className="context-menu">
            <button
                className="context-menu-item block"
                onClick={() =>
                    handleContextMenuAction("Block", item.id)
                }
                disabled={isUpdating || item.blocked }
            >
                {isUpdating ? "Updating..." : "Block"}
            </button>
            <button
                className="context-menu-item unblock"
                onClick={() =>
                    handleContextMenuAction("Unblock", item.id)
                }
                disabled={isUpdating || !item.blocked}
            >
                {isUpdating ? "Updating..." : "Unblockd"}
            </button>
        </div>
    )
}
