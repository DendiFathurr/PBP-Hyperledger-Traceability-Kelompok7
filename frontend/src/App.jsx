import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RegisterExport from './components/RegisterExport';
import UpdateStatus from './components/UpdateStatus';
import Traceability from './components/Traceability';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedContainerId, setSelectedContainerId] = useState(null);

  // Router sederhana berdasarkan State Tab
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            setSelectedContainerId={setSelectedContainerId} 
          />
        );
      case 'register':
        return <RegisterExport />;
      case 'update':
        return <UpdateStatus />;
      case 'trace':
        return (
          <Traceability 
            selectedContainerId={selectedContainerId} 
            setSelectedContainerId={setSelectedContainerId} 
          />
        );
      default:
        return (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            setSelectedContainerId={setSelectedContainerId} 
          />
        );
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
