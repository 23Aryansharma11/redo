'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import * as yup from 'yup';

const DynamicModal = dynamic(() => import('@/components/modal-form'), { ssr: false });

export default function Page() {
    const [isOpen, setIsOpen] = useState(false);
    const [mountCount, setMountCount] = useState(0);

    useEffect(() => {
        console.log('%c[BACKGROUND POPUP] Sibling component mounted. Hijacking yup.addMethod globally...', 'color: orange; font-weight: bold');
        yup.addMethod<yup.StringSchema>(yup.string, 'customPhone', function () {
            return this.test('customPhone', 'Hijacked Error', function () {
                console.error('%c[YUP-FATAL] Validation hijacked by background component! Crashing to simulate silent RHF failure.', 'color: red; font-weight: bold; font-size: 14px');
                throw new Error("Stale Global Closure Crash");
            });
        });
    }, []);

    return (
        <main style={{ padding: '50px', fontFamily: 'monospace' }}>
            <h2>Production Race Condition Simulator</h2>
            <button 
                onClick={() => {
                    console.log(`\n%c--- USER CLICKED OPEN MODAL (Attempt ${mountCount + 1}) ---`, 'background: blue; color: white; padding: 4px;');
                    setIsOpen(true);
                    setMountCount(prev => prev + 1);
                }}
                style={{ padding: '10px 20px', cursor: 'pointer', background: '#333', color: '#fff' }}
            >
                Open Dynamic Modal
            </button>
            
            {isOpen && (
                <DynamicModal 
                    attempt={mountCount}
                    onClose={() => {
                        console.log('\n%c--- USER CLOSED MODAL ---', 'background: gray; color: white; padding: 4px;');
                        setIsOpen(false);
                    }} 
                />
            )}
        </main>
    );
}