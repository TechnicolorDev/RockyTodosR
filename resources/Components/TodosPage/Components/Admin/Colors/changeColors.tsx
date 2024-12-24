import React, { useState, useEffect } from 'react';
import { useColors } from '../../../../../api/Providers/Color/ColorContext';
import { ChromePicker } from 'react-color';
import { Color } from '../../../../../api/Providers/interfaces/interfaces';

const ColorSettings: React.FC = () => {
    const { colors, handleSaveColor, handleResetColors} = useColors();
    const [editingColor, setEditingColor] = useState<keyof Color | null>(null);
    const [newColorValue, setNewColorValue] = useState<string>('');
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [previewColor, setPreviewColor] = useState<string>('');

    const handleColorChange = (colorName: keyof Color) => {
        setEditingColor(colorName);
        setNewColorValue(colors![colorName as keyof Color] || '');
        setPreviewColor(colors![colorName as keyof Color] || '');
        setShowPicker(true);
    };

    const handleColorValueChange = (color: { hex: string }) => {
        setNewColorValue(color.hex);
        setPreviewColor(color.hex);

        if (editingColor) {

        }
    };

    const handleSave = async () => {
        if (editingColor && newColorValue) {
            await handleSaveColor(editingColor, newColorValue);
            setEditingColor(null);
            setNewColorValue('');
            setShowPicker(false);
        }
    };

    const handleSaveAll = async () => {
        if (colors) {
            try {
                for (const colorName in colors) {
                    if (colors.hasOwnProperty(colorName)) {
                        const colorValue = colors[colorName as keyof Color];
                        await handleSaveColor(colorName as keyof Color, colorValue);
                    }
                }
                console.log('All colors saved!');
            } catch (error) {
                console.error('Error saving all colors:', error);
            }
        } else {
            console.error('No colors available to save');
        }
    };

    const handleResetAll = async () => {
        await handleResetColors();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editingColor && !document.getElementById('color-picker')?.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showPicker, editingColor]);

    if (!colors) {
        return <div>Loading colors...</div>;
    }

    return (
        <div className="color-settings">
            <h2>Color Settings</h2>
            <div className="colors-list">
                {Object.entries(colors).map(([colorName, colorValue]) => (
                    <div key={colorName} className="color-item">
                        <span>{colorName}:</span>
                        <span
                            className="color-box"
                            style={{ backgroundColor: colorValue }}
                        />
                        <button
                            className="edit-btn"
                            onClick={() => handleColorChange(colorName as keyof Color)}
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>

            {/* Display the color picker only if a color is being edited */}
            {editingColor && showPicker && (
                <div className="edit-section" id="color-picker">
                    <h3>Edit {editingColor}</h3>
                    <ChromePicker
                        color={newColorValue}
                        onChange={handleColorValueChange}
                    />
                    <button className="save-btn" onClick={handleSave}>Save</button>
                </div>
            )}

            <div className="edit-section">
                <button className="save-btn" onClick={handleSaveAll}>Save All</button>
                <button className="reset-btn" onClick={handleResetAll}>Reset All</button>
            </div>
        </div>
    );
};

export default ColorSettings;
