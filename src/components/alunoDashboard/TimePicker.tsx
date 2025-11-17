// components/TimePicker.tsx
"use client";

import React, { useState, useEffect, useRef, FC } from 'react';
import './timePicker.css';

interface TimePickerProps { 
    value: string; 
    onChange: (time: string) => void; 
}

const ClockIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V5z" clipRule="evenodd" />
    </svg>
);

// --- CORREÇÃO DO LOOP INFINITO ---

// O PADDING_SIZE deve ser pelo menos (tamanho_viewport / 2)
// Viewport = 150px / 3 itens. Item = 50px.
// Vamos usar 3 para garantir.
const PADDING_SIZE = 3; 
// Altura do item em pixels, DEVE corresponder ao CSS
const ITEM_HEIGHT = 50; 

const TimePicker: FC<TimePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentHour, setCurrentHour] = useState<number>(() => parseInt(value.split(':')[0], 10));
    const [currentMinute, setCurrentMinute] = useState<number>(() => parseInt(value.split(':')[1], 10));

    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Refs para evitar que a lógica de 'scroll' e 'teleporte' briguem
    const isTeleporting = useRef(false);

    // Listas "Reais"
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    // Listas "Preenchidas"
    const paddedHours = [
        ...hours.slice(-PADDING_SIZE), 
        ...hours,                      
        ...hours.slice(0, PADDING_SIZE)  
    ];
    const paddedMinutes = [
        ...minutes.slice(-PADDING_SIZE), 
        ...minutes,                      
        ...minutes.slice(0, PADDING_SIZE)  
    ];

    // Rola para o item "real" (no bloco do meio)
    const scrollToSelected = (ref: React.RefObject<HTMLDivElement | null>, list: number[], selectedValue: number) => {
        if (ref.current) { 
            const realItemIndex = list.indexOf(selectedValue);
            const targetIndexInPaddedArray = realItemIndex + PADDING_SIZE;
            
            // Calcula a posição de scroll para centralizar o item
            const targetScrollTop = (targetIndexInPaddedArray * ITEM_HEIGHT) - (ref.current.clientHeight / 2) + (ITEM_HEIGHT / 2);

            // Desativa a lógica de scroll_teleporte temporariamente
            isTeleporting.current = true;
            ref.current.scrollTop = targetScrollTop;
            
            // Re-ativa após um momento
            setTimeout(() => {
                isTeleporting.current = false;
            }, 100); // 100ms é suficiente
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const togglePopover = () => {
        if (!isOpen) {
            setCurrentHour(parseInt(value.split(':')[0], 10));
            setCurrentMinute(parseInt(value.split(':')[1], 10));
            setIsOpen(true);
            
            setTimeout(() => {
                scrollToSelected(hourRef, hours, parseInt(value.split(':')[0], 10));
                scrollToSelected(minuteRef, minutes, parseInt(value.split(':')[1], 10));
            }, 0);
        } else {
            setIsOpen(false);
        }
    };

    const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setter: React.Dispatch<React.SetStateAction<number>>, realList: number[]) => {
        if (ref.current && !isTeleporting.current) {
            const element = ref.current;
            const { scrollTop, scrollHeight, clientHeight } = element;

            const realContentHeight = realList.length * ITEM_HEIGHT;
            
            // Limite inferior (onde os clones do fim começam)
            const bottomThreshold = (realList.length + PADDING_SIZE) * ITEM_HEIGHT - (clientHeight / 2) - (ITEM_HEIGHT / 2);
            // Limite superior (onde os clones do início terminam)
            const topThreshold = PADDING_SIZE * ITEM_HEIGHT - (clientHeight / 2) + (ITEM_HEIGHT / 2);
            
            let newScrollTop = scrollTop;

            // Se o scroll está na última "página" (o clone do fim)
            if (scrollTop >= bottomThreshold) {
                // Teleporta para o início
                newScrollTop = scrollTop - realContentHeight;
            } 
            // Se o scroll está na primeira "página" (o clone do início)
            else if (scrollTop <= topThreshold) {
                // Teleporta para o fim
                newScrollTop = scrollTop + realContentHeight;
            }

            if (newScrollTop !== scrollTop) {
                isTeleporting.current = true;
                element.scrollTop = newScrollTop;
                // Re-ativa a detecção após o teleporte
                setTimeout(() => { isTeleporting.current = false; }, 50); // Um delay curto
            }

            // Lógica de debounce para ATUALIZAR O ESTADO
            clearTimeout((element as any).scrollTimeout);
            (element as any).scrollTimeout = setTimeout(() => {
                // Encontra o item mais próximo do centro
                const center = element.scrollTop + (clientHeight / 2);
                let closestValue = realList[0];
                let minDiff = Infinity;

                element.querySelectorAll('.time-picker-option[data-value]').forEach(optionElement => {
                    const el = optionElement as HTMLElement;
                    const elCenter = el.offsetTop + (el.clientHeight / 2);
                    const diff = Math.abs(center - elCenter);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestValue = parseInt(el.dataset.value || '0', 10);
                    }
                });
                
                // Atualiza o estado
                setter(closestValue);

            }, 150); // 150ms de debounce
        }
    };

    const handleConfirm = () => {
        const newTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        onChange(newTime); 
        setIsOpen(false);
    };

    // Funções de clique
    const handleHourClick = (hour: number) => {
        setCurrentHour(hour);
        scrollToSelected(hourRef, hours, hour); // Clica e centraliza
    };

    const handleMinuteClick = (minute: number) => {
        setCurrentMinute(minute);
        scrollToSelected(minuteRef, minutes, minute); // Clica e centraliza
    };

    return (
        <div className="time-picker-wrapper" ref={wrapperRef}>
            <div className="time-picker-trigger" onClick={togglePopover}>
                <span>{value}</span>
                <span className="time-picker-icon"><ClockIcon /></span>
            </div>

            {isOpen && (
                <div className="time-picker-popover">
                    <div className="time-picker-rollers">
                        <div 
                            className="time-picker-column" 
                            ref={hourRef} 
                            onScroll={() => handleScroll(hourRef, setCurrentHour, hours)}
                        >
                            {paddedHours.map((hour, index) => (
                                <div 
                                    key={index} 
                                    className={`time-picker-option ${currentHour === hour ? 'selected' : ''}`}
                                    data-value={hour}
                                    data-index={index} 
                                    onClick={() => handleHourClick(hour)}
                                >
                                    {String(hour).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                        
                        <div className="time-picker-separator">:</div>
                        
                        <div 
                            className="time-picker-column" 
                            ref={minuteRef} 
                            onScroll={() => handleScroll(minuteRef, setCurrentMinute, minutes)}
                        >
                            {paddedMinutes.map((minute, index) => (
                                <div 
                                    key={index} 
                                    className={`time-picker-option ${currentMinute === minute ? 'selected' : ''}`}
                                    data-value={minute}
                                    data-index={index} 
                                    onClick={() => handleMinuteClick(minute)}
                                >
                                    {String(minute).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="time-picker-actions">
                        <button type="button" className="time-picker-confirm-btn" onClick={handleConfirm}>
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;