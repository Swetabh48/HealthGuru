import React from 'react';
import {AnimatePresence } from 'framer-motion';
import { useWellness, WellnessProvider } from './contexts/WellnessContext'; 

import Navigation from './components/Navigation';
import ProfileCapture from './components/ProfileCapture';
import RecommendationBoard from './components/RecommendationBoard';
import SavedTips from './components/SavedTips';
import TipDetail from './components/TipDetail';
import LoadingSpinner from './components/LoadingSpinner';


/**
 * Main application router and shell.
 * It uses the state from WellnessContext to determine which main screen to render.
 */
export const App: React.FC = () => {
    const { currentScreen, userProfile, isLoading } = useWellness();

    const renderScreen = () => {
        // If the profile is not set and we aren't on the profile screen, redirect to capture.
        if (!userProfile && currentScreen !== 'profile') {
            // We can show the spinner if the app is still loading initial state, 
            // otherwise, force profile capture.
            return isLoading ? <LoadingSpinner key="initial-load" /> : <ProfileCapture key="profile-capture" />;
        }
        
        switch (currentScreen) {
            case 'profile':
                return <ProfileCapture key="profile" />;
            case 'board':
                return <RecommendationBoard key="board" />;
            case 'saved':
                return <SavedTips key="saved" />;
            case 'detail':
                return <TipDetail key="detail" />;
            default:
                // Fallback to the main board
                return <RecommendationBoard key="default-board" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            {/* Header (Always Visible) */}
            <header className="p-4 bg-white shadow-lg sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-indigo-600">Wellness Board</h1>
            </header>
            
            <main className="min-h-[calc(100vh-80px)] w-full"> 
                <AnimatePresence mode="wait" initial={false}>
                    {renderScreen()}
                </AnimatePresence>
            </main>

            {/* Navigation (Only visible on mobile when profile is complete) */}
            <Navigation />
        </div>
    );
};

/**
 * Root wrapper to ensure the entire application is within the context provider.
 */
const Root: React.FC = () => (
    <WellnessProvider>
        <App />
    </WellnessProvider>
);

export default Root;
