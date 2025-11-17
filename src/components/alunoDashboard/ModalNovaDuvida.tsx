// components/ModalNovaDuvida.tsx
"use client";

import { useState, useEffect, FC, FormEvent } from "react";
import ReactDOM from "react-dom";
import './novaDuvida.css'; 
import FileUpload from "./FileUpload";
import TimePicker from "./TimePicker"; 

interface ModalNovaDuvidaProps {
    onClose: () => void;
}

const ModalNovaDuvida: FC<ModalNovaDuvidaProps> = ({ onClose }) => {
    
    const [isMounted, setIsMounted] = useState<boolean>(false);
    
    // Estado para o *valor confirmado* do TimePicker
    const [selectedTime, setSelectedTime] = useState<string>("12:00"); 

    useEffect(() => {
        setIsMounted(true); 
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Crie um objeto FormData para ver os dados
        const formData = new FormData(e.currentTarget);
        const data = {
            titulo: formData.get('name'),
            disciplina: formData.get('course'),
            data: formData.get('prazo'),
            hora: formData.get('hora'), // O valor virá do input hidden
            bio: formData.get('bio')
        };

        console.log("Formulário enviado:", data);
        onClose();
    }

    if (!isMounted) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <span className="close-btn" onClick={onClose}>&times;</span>
                <h2>Adicionar Uma Dúvida</h2>

                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Dados da atividade</legend>
                        <h3>Anexe sua atividade</h3>
                        <FileUpload />

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Título da Atividade *</label>
                                <input type="text" id="name" name="name" placeholder="Ex: Resumo de Biologia" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="course">Qual a disciplina? *</label>
                                <select id="course" name="course" required defaultValue="">
                                    <option value="" disabled>Selecione uma disciplina</option>
                                    <option value="Matemática">Matemática</option>
                                    <option value="Português">Português</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="prazo">Prazo (Data) *</label>
                                <input type="date" id="prazo" name="prazo" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="hora">Prazo (Hora) *</label>
                                
                                {/* O TimePicker agora recebe 'value' e 'onChange' */}
                                <TimePicker 
                                    value={selectedTime} 
                                    onChange={setSelectedTime} 
                                />
                                
                                {/* Input hidden para que o formulário possa enviar o valor */}
                                <input type="hidden" id="hora" name="hora" value={selectedTime} />
                            </div>
                        </div>
                        
                        <div className="form-group full-width">
                            <label htmlFor="bio">Explique o que deve ser feito (opcional)</label>
                            <textarea id="bio" name="bio" rows={3} placeholder="Ex: Preciso que o trabalho seja digitalizado..."></textarea>
                        </div>
                    </fieldset>

                    <details>
                        <summary>Material complementar para o tutor (opcional)</summary>
                        <FileUpload />
                    </details>

                    <div className="form-buttons">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="submit-btn">Adicionar Dúvida</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default ModalNovaDuvida;