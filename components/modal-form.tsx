'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';

declare module 'yup' {
    interface StringSchema {
        customPhone(message?: string): StringSchema;
    }
}

export default function ModalForm({ onClose, attempt }: { onClose: () => void, attempt: number }) {
    console.log(`%c[MODAL RENDER] Executing Component Body. Attempt: ${attempt}`, 'color: cyan; font-weight: bold');

    const [country, setCountry] = useState('IN');

    // Simulating the Next.js execution delay/race condition on first load
    if (attempt === 1) {
        console.log('%c[MODAL EXECUTION] First load: yup.addMethod runs, but global prototype is actively fighting sibling component.', 'color: yellow');
    } else {
        console.log('%c[MODAL EXECUTION] Second load: Global prototype already permanently mutated by previous render. Safe.', 'color: lime');
    }

    yup.addMethod<yup.StringSchema>(
        yup.string,
        'customPhone',
        function (message?: string) {
            console.log('%c[YUP-BUILD] Attaching customPhone to global prototype from Modal.', 'color: magenta');
            return this.test(
                'customPhone',
                message || 'Invalid',
                function (value) {
                    console.log('%c[YUP-EXEC] Modal customPhone validation executing. Value:', 'color: magenta', value);
                    const { path, createError } = this;

                    if (!value) {
                        return createError({ path, message: message || 'Phone is required' });
                    }
                    return true;
                }
            );
        }
    );

    const schema = yup.object({
        firstName: yup.string().required('First name is required'),
        phone: yup.string().customPhone(`Invalid phone for ${country}`)
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    // Simulate react-phone-number-input's immediate onMount state change which scrambles the un-memoized schema
    useEffect(() => {
        if (attempt === 1) {
            console.log('%c[MODAL MOUNT] Simulating phone input state change to scramble schema reference...', 'color: orange');
            setCountry('US');
        }
    }, [attempt]);

    console.log('%c[MODAL STATE] Current form errors object:', 'color: cyan', errors);

    const onSubmit = (data: any) => console.log('%c--- RHF SUCCESS: SUBMITTED DATA ---', 'background: green; color: white', data);
    const onError = (errs: any) => console.log('%c--- RHF BLOCKED: VALIDATION CAUGHT ---', 'background: red; color: white', errs);

    return (
        <div style={{ border: '2px solid red', padding: '20px', marginTop: '20px', background: '#111', color: '#fff' }}>
            <h3>Brochure Modal Form</h3>

            <form onSubmit={(e) => {
                console.log('\n%c--- USER CLICKED SUBMIT ---', 'background: purple; color: white; padding: 4px;');

                // On first attempt, we simulate the global prototype resolving to the sibling's hijacked crash method
                if (attempt === 1) {
                    try {
                        console.log('%c[RESOLVER] Passing payload to Yup...', 'color: yellow');
                        yup.string().customPhone().validateSync('');
                    } catch (err: any) {
                        console.error('%c[RHF-INTERNAL-CATCH] Resolver caught native crash. Swallowing errors and halting submission.', 'color: red');
                        e.preventDefault();
                        return; // Silent fail
                    }
                }

                handleSubmit(onSubmit, onError)(e);
            }}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="">FIRSTNAME</label>
                    <input
                        placeholder="First Name"
                        {...register('firstName')}
                        style={{ padding: '8px', color: 'black' }}
                    />
                    {errors.firstName && <p style={{ color: '#ff4444', margin: '5px 0' }}>{errors.firstName.message as string}</p>}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <Controller
                        name="phone"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <>
                                <label htmlFor="">PHONE</label>
                                <input {...field} placeholder="Phone" style={{ padding: '8px', color: 'black' }} />
                            </>
                        )}
                    />
                    {errors.phone && <p style={{ color: '#ff4444', margin: '5px 0' }}>{errors.phone.message as string}</p>}
                </div>

                <button type="submit" style={{ padding: '8px 16px', marginRight: '10px', background: 'blue', color: 'white', border: 'none' }}>
                    Submit Empty Form
                </button>
                <button type="button" onClick={onClose} style={{ padding: '8px 16px', color: 'black' }}>
                    Close
                </button>
            </form>
        </div>
    );
}