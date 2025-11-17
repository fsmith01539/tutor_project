"use client";

import { useState, FC } from "react"; // Importar FC
import './novaDuvida.css';
import ModalNovaDuvida from "./ModalNovaDuvida"; // Irá importar ModalNovaDuvida.tsx

// FC (Functional Component) é um tipo que representa um componente funcional
const NovaDuvida: FC = () => {
    // Tipagem explícita do estado para 'boolean'
    const [modalAberto, setModalAberto] = useState<boolean>(false);

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    return (
        <div>
            <button className='primaryButton' onClick={abrirModal}>
                + Nova Dúvida
            </button>
            
            {/* O modal agora recebe a prop 'onClose' obrigatória */}
            {modalAberto && <ModalNovaDuvida onClose={fecharModal} />}
        </div>
    );
}

export default NovaDuvida;