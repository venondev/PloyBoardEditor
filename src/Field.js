import React, {useReducer, useState} from "react";
import {toast, ToastContainer} from "react-toastify";

const COLORS = {
    WHITE: "white",
    BLACK: "black"
};

const DIRS = {
    UP: "0deg",
    UP_RIGHT: "45deg",
    RIGHT: "90deg",
    DOWN_RIGHT: "135deg",
    DOWN: "180deg",
    DOWN_LEFT: "225deg",
    LEFT: "270deg",
    UP_LEFT: "315deg"
};

const DIR_SORTED = Object.values(DIRS);

const TOKENS = [
    [DIRS.UP],
    [DIRS.UP, DIRS.DOWN],
    [DIRS.UP_LEFT, DIRS.UP_RIGHT],
    [DIRS.UP, DIRS.UP_LEFT],
    [DIRS.UP, DIRS.UP_RIGHT, DIRS.UP_LEFT],
    [DIRS.DOWN, DIRS.UP_RIGHT, DIRS.UP_LEFT],
    [DIRS.DOWN, DIRS.RIGHT, DIRS.LEFT],
    [DIRS.UP_RIGHT, DIRS.DOWN_RIGHT, DIRS.DOWN_LEFT, DIRS.UP_LEFT]
];

const getInitialField = () => {
    return Array.from(new Array(9), () => Array.from(new Array(9), () => ({})));
};

const rotate = dirs => dirs.map((dir) => DIR_SORTED[(DIR_SORTED.indexOf(dir) + 1) % (DIR_SORTED.length)])

const fieldReducer = (state, action) => {

    const setToken = (xCord, yCord, dirs, isWhite) =>
        state.map((row, y) => row.map((item, x) => yCord === y && xCord === x ? {
            dirs,
            isWhite
        } : item));

    switch (action.type) {
        case "FIELD_CLICK": {
            console.log(state[action.y][action.x]?.dirs)

            if (state[action.y][action.x]?.dirs) {
                console.log(rotate(state[action.y][action.x].dirs));
                return setToken(action.x, action.y, rotate(state[action.y][action.x].dirs), action.isWhite)
            } else {
                return setToken(action.x, action.y, TOKENS[action.currentToolIdx], action.isWhite)
            }
        }
        case "FIELD_ERASE": {
            return setToken(action.x, action.y, undefined, false)
        }
    }
};

const Item = ({dirs = [], isWhite, isSelected, onClick}) => {
    return (
        <div onClick={onClick} style={{background: isWhite ? COLORS.WHITE : COLORS.BLACK}} className={`item ${!dirs.length && "empty"} ${isSelected ? "selected" : ""}`}>
        {dirs.map(dir =>
            <div style={{transform: `rotate(${dir})`}} className="line"></div>
        )}
    </div>)
};

const Toolbelt = ({isWhite, toggleColor, currentToolIdx, setTool, erase, setErase, copyToClip}) => {

    return (<div onClick={() => erase && setErase(false)} className={`toolbelt`}>
        <div onClick={() => toggleColor(color => !color)}
             className={`colorpicker ${isWhite ? COLORS.WHITE : COLORS.BLACK}`}>
        </div>
        <div style={{opacity: erase ? "0.2" : "1"}}>
            {TOKENS.map((token, idx) => <Item
                isSelected={idx === currentToolIdx}
                onClick={() => setTool(idx)}
                dirs={token}
                isWhite={isWhite}
            />)}
        </div>
        <div onClick={() => setErase(e => !e)} className={`erase ${erase && "active"}`}></div>

        <button className="copybtn" onClick={copyToClip}>Copy to clipboard</button>
    </div>)

};

function copyStringToClipboard (str) {
    // Temporäres Element erzeugen
    var el = document.createElement('textarea');
    // Den zu kopierenden String dem Element zuweisen
    el.value = str;
    // Element nicht editierbar setzen und aus dem Fenster schieben
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Text innerhalb des Elements auswählen
    el.select();
    // Ausgewählten Text in die Zwischenablage kopieren
    document.execCommand('copy');
    // Temporäres Element löschen
    document.body.removeChild(el);
}

const Field = () => {
    const [fields, dispatch] = useReducer(fieldReducer, getInitialField())
    const [isWhite, toggleColor] = useState(true);
    const [currentToolIdx, setTool] = useState(0);
    const [erase, setErase] = useState(false);

    const copyFieldToClipboard = () => {
        const ret = fields.reduce((acc, row, y) => acc + row.reduce((rowAcc, item, x) => {
            if(item && item.dirs) {
                const binaryString = DIR_SORTED.slice().reverse().map(x => item.dirs.includes(x) ? "1" : "0").join("");
                const color = item.isWhite ? "w" : "b";

                return rowAcc + `${color}${parseInt(binaryString, 2)}${x == row.length - 1 ? "" : ","}`
            } else {
                return rowAcc + ",";
            }

        }, "") + (y == fields.length - 1 ? "" : "/"), "")
        copyStringToClipboard(ret);
        toast("Copied to clipboard");
    };

    return (<div className="main">
        <div>
            <Toolbelt
                currentToolIdx={currentToolIdx}
                setTool={setTool}
                isWhite={isWhite}
                toggleColor={toggleColor}
                erase={erase}
                setErase={setErase}
                copyToClip={copyFieldToClipboard}
            />
        </div>
        <div>
            {fields.map((row, y) => (
                <div className="row" key={y}>
                    {row.map((item, x) => <Item
                        onClick={() => erase
                            ? dispatch({ type: "FIELD_ERASE", x, y })
                            : dispatch({ type: "FIELD_CLICK", isWhite, currentToolIdx, x, y })
                        }
                        key={x}
                        {...item}
                    />)}
                </div>
            ))}
        </div>
        <ToastContainer />
    </div>)
};

export default Field;