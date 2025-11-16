"use client";

import './duvidaCard.css';
import { HiUserCircle } from "react-icons/hi";
import { useState, useEffect } from 'react';
import ReactDOM from "react-dom";

interface Duvida {
    id: number;
    titulo: string;
    materia: string;
    status: string;
    conteudo: string;
    respondidoPor?: string | null;
    tempo: string;
}

type DuvidaCardProps = {
    duvida: Duvida;
};


const getStatusClass = (status: string) => {
    if (status === "Respondida") {
        return "status-respondida";
    }
    if (status === "Aguardando Monitor") {
        return "status-aguardando";
    }
    return "status-default";
};

const DuvidaCard = ({ duvida }: DuvidaCardProps) => {

    const [modalAberto, setModalAberto] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); // O componente montou no cliente
    }, []);

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleFecharClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        fecharModal(); 
    };
    const AbrirDetalhes = () => {

        if (!isMounted) {
            return null;
        }

        return ReactDOM.createPortal(
            <div className="modal">
                <div className="modal-content">
                    <button aria-label="Fechar modal" className="close-btn" onClick={handleFecharClick}> &times; </button>
                    <h2 className="titulo">{duvida.titulo}</h2>
                    <div className='conteudo-duvida'>
                        <div className='descricao'>
                            <p>{duvida.conteudo}</p>
                        </div>
                        <div className='duvida-stats-modal'>
                            <div className="tag-expandida tag-materia-expandida">{duvida.materia}</div>
                            <div className={`tag-expandida status-tag ${getStatusClass(duvida.status)}`}>{duvida.status}</div>
                            <div className="tag-expandida tag-materia-expandida">{duvida.tempo}</div>
                            <div className="tag-expandida tag-materia-expandida">{duvida.respondidoPor}</div>
                        </div>
                    </div>
                </div>

            </div>,
            document.body
        );
    }


    if (!duvida) {
        return null;
    }

    const handleVerConversaClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        //Lógica da conversa (mock)
    };

    return (
        <div className="duvida-card" onClick={abrirModal}>
            <div className="duvida-card-header">
                <h3 className="duvida-card-titulo">{duvida.titulo}</h3>
                <div className="duvida-card-tags">
                    <span className={`tag status-tag ${getStatusClass(duvida.status)}`}>
                        {duvida.status}
                    </span>
                    <span className="tag tag-materia">{duvida.materia}</span>
                </div>
            </div>

            <div className="footer-acoes">
                <span className="duvida-tempo">{duvida.tempo}</span>
                <button className="btn-ver-conversa" onClick={handleVerConversaClick}>Ver Conversa</button>
            </div>
            {modalAberto && <AbrirDetalhes />}
        </div>
    );
};

export default DuvidaCard;