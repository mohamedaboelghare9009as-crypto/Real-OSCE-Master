import React, { useEffect } from 'react';
import { SimulationLayout } from './simulation/SimulationLayout';
import { CommunicationZone } from './simulation/CommunicationZone';
import { DDxSidebar } from './simulation/DDxSidebar';
import { ExaminationPhase } from './simulation/phases/ExaminationPhase';
import { InvestigationPhase } from './simulation/phases/InvestigationPhase';
import { ManagementPhase } from './simulation/phases/ManagementPhase';
import { useSimulationStore } from '../stores/useSimulationStore';
import { useNavigate } from 'react-router-dom';

export const SimulationPage: React.FC = () => {
  const { currentPhase } = useSimulationStore();
  const navigate = useNavigate();

  // Handle automatic navigation to feedback when phase changes to 'Feedback'
  useEffect(() => {
    if (currentPhase === 'Feedback') {
      navigate('/feedback-demo');
    }
  }, [currentPhase, navigate]);

  // Render content based on current phase
  const renderContent = () => {
    switch (currentPhase) {
      case 'History':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
              <h2 className="text-2xl font-bold text-osce-navy">History Taking Phase</h2>
              <p className="text-slate-500">
                Use the communication panel on the left to interview the patient.
                Ask about their presenting complaint, history, and risk factors.
              </p>
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm border border-yellow-100">
                💡 Tip: You must identify at least 3 differential diagnoses to proceed.
              </div>
            </div>
          </div>
        );
      case 'Examination':
        return <ExaminationPhase />;
      case 'Investigation':
        return <InvestigationPhase />;
      case 'Management':
        return <ManagementPhase />;
      default:
        return <div>Phase not implemented</div>;
    }
  };

  return (
    <SimulationLayout
      leftPanel={<CommunicationZone />}
      rightPanel={<DDxSidebar />}
    >
      {renderContent()}
    </SimulationLayout>
  );
};
