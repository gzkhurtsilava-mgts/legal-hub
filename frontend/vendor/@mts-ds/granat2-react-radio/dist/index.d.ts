import * as React from 'react';
import { ComponentPropsWithoutRef } from 'react';

interface RadioProps extends Omit<ComponentPropsWithoutRef<'input'>, 'checked'> {
    /** Размер компонента */
    size?: 16 | 24 | 32;
    /** Состояние checked/unchecked контролируемого компонента */
    checked?: boolean;
    /** Состояние ошибки */
    invalid?: boolean;
    /** Признак не активного состояния компонента */
    disabled?: boolean;
}
declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=radio.d.ts.map

export { Radio, RadioProps };
