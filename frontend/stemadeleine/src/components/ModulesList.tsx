import React, { useEffect } from 'react';
import useGetModules from '../hooks/useGetModules';
import ModuleRenderer from './ModuleRenderer';

export interface ModuleType {
  id: string;
  type: string;
  title?: string;
  name?: string;
  isVisible?: boolean;
  sortOrder?: number;

  [key: string]: unknown;
}

interface Props {
  sectionId: string;
  className?: string;
}

const ModulesList: React.FC<Props> = ({ sectionId, className = '' }) => {
  const { modules, loading, error, fetchModulesBySectionId } = useGetModules();

  useEffect(() => {
    if (sectionId) {
      fetchModulesBySectionId(sectionId).catch(console.error);
    }
  }, [sectionId, fetchModulesBySectionId]);

  if (loading) {
    return (
      <div className={`w-full py-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des modules...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full py-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Erreur lors du chargement des modules: {String(error)}
          </p>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className={`w-full py-8 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Aucun module disponible pour cette section.</p>
        </div>
      </div>
    );
  }

  // Sort modules by sortOrder
  const sortedModules = [...modules].sort(
    (a: ModuleType, b: ModuleType) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
  );

  return (
    <div className={`w-full ${className}`}>
      {sortedModules.map((module: ModuleType) => (
        <ModuleRenderer key={module.id} module={module} />
      ))}
    </div>
  );
};

export default ModulesList;

