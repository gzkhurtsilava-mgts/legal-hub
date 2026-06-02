import * as React from 'react';
import { ComponentPropsWithoutRef, ReactNode, FC, ReactElement } from 'react';

declare type BreadcrumbBaseProps = {
    /** Размер компонента */
    size?: 20 | 24;
};
interface BreadcrumbItemProps extends ComponentPropsWithoutRef<'li'> {
    /** Ссылка */
    href?: string;
    /** Функция-обработчик нажатия на элемент */
    onClick?: () => void;
    /** Текст хлебной крошки */
    children?: ReactNode;
    active?: boolean;
    oneLine?: boolean;
    metaContent?: string;
    size?: BreadcrumbBaseProps['size'];
}

declare const BreadcrumbItem: FC<BreadcrumbItemProps>;
//# sourceMappingURL=breadcrumb-item.d.ts.map

interface BreadcrumbProps extends ComponentPropsWithoutRef<'ol'>, BreadcrumbBaseProps {
    children: ReactElement<typeof BreadcrumbItem> | ReactElement<typeof BreadcrumbItem>[];
}
declare const Breadcrumb: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<HTMLOListElement>>;
//# sourceMappingURL=breadcrumb.d.ts.map

export { Breadcrumb, BreadcrumbItem, BreadcrumbItemProps, BreadcrumbProps };
