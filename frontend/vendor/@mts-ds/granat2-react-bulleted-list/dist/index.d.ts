import * as React from 'react';
import { ReactNode, ReactElement } from 'react';

declare type SubListItemProps = {
    className?: string;
    children: ReactNode;
} & React.ComponentPropsWithoutRef<'li'>;
declare const SubListItem: React.ForwardRefExoticComponent<{
    className?: string | undefined;
    children: ReactNode;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;
//# sourceMappingURL=sub-list-item.d.ts.map

declare type SubListProps = {
    className?: string;
    children: ReactElement<SubListItemProps> | ReactElement<SubListItemProps>[];
} & React.ComponentPropsWithoutRef<'ul'>;
declare const SubList: React.ForwardRefExoticComponent<{
    className?: string | undefined;
    children: ReactElement<SubListItemProps> | ReactElement<SubListItemProps>[];
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, "key" | keyof React.HTMLAttributes<HTMLUListElement>> & React.RefAttributes<HTMLUListElement>>;
//# sourceMappingURL=sub-list.d.ts.map

declare type ListItemProps = {
    /** Заголовок */
    title?: string;
    /** Под заголовок */
    subTitle?: string;
    /** Дочерний элемент, может быть string или <> */
    children: ReactNode | ReactElement<SubListProps>;
    /**
     * A11y
     */
    ariaLevel?: number;
    className?: string;
} & React.ComponentPropsWithoutRef<'li'>;
declare const ListItem: React.ForwardRefExoticComponent<{
    /** Заголовок */
    title?: string | undefined;
    /** Под заголовок */
    subTitle?: string | undefined;
    /** Дочерний элемент, может быть string или <> */
    children: ReactNode | ReactElement<SubListProps>;
    /**
     * A11y
     */
    ariaLevel?: number | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;
//# sourceMappingURL=item.d.ts.map

declare type ListProps = {
    /** Должны быть только <MtsDsBulletedListItem> */
    children: ReactElement<ListItemProps> | ReactElement<ListItemProps>[];
    /** Тип устройства */
    device?: 'desktop' | 'mobile';
    /** Отступ, например 10px */
    gap?: string;
    className?: string;
    style?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<'ul'>;
declare const List: React.ForwardRefExoticComponent<{
    /** Должны быть только <MtsDsBulletedListItem> */
    children: ReactElement<ListItemProps> | ReactElement<ListItemProps>[];
    /** Тип устройства */
    device?: "desktop" | "mobile" | undefined;
    /** Отступ, например 10px */
    gap?: string | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, "key" | keyof React.HTMLAttributes<HTMLUListElement>> & React.RefAttributes<HTMLUListElement>>;
//# sourceMappingURL=list.d.ts.map

export { List, ListItem, ListItemProps, ListProps, SubList, SubListItem, SubListItemProps, SubListProps };
