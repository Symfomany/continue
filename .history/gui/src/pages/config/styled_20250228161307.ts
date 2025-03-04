// src/pages/Config/ConfigStyles.ts
import styled from 'styled-components';

export const TemplateContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  border: 1px dotted #666;
  padding: 10px;
  border-radius: 5px;
  margin: 5px;
    justify-content: space-between;
`;

export const TemplateTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

export const TemplateContent = styled.div`
  font-size: 1rem;
  margin-bottom: 8px;
`;

export const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
`;

export const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #388E3C;
  }
`;

export const EditButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 5px 9px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #1976D2;
  }
`;

export const EditorContainer = styled.div`
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;
