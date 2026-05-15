import { AnalysisCheckId, AnalysisCheckStatus } from "../models/analysis-check.model";
import { RiskLevel } from "../models/analysis-result.model";
import { PageType } from "../models/page-type.model";

type CheckConfig = Record<AnalysisCheckId, {
    message: string,
    icon: string,
    label: string,
    values: Record<AnalysisCheckStatus, string>
}>;

type PageTypeConfig = Record<PageType, {
    label: string,
    description: string
}>;

type RiskLevelConfig = Record<RiskLevel, {
    label: string,
    description: string,
    theme: string,
    icon: string,
}>;

export const PAGE_TYPE_CONFIG: PageTypeConfig = {
    [PageType.NOT_PRODUCT_PAGE]: {
        label: 'not product page',
        description: 'Сторінка не містить достатніх ознак продажу товару.',
    },
    [PageType.NORMAL_SHOP_PAGE]: {
        label: 'category page',
        description: 'Сторінка схожа на звичайний магазин або каталог товарів.',
    },
    [PageType.UNKNOWN_PRODUCT_PAGE]: { // TODO: rename
        label: 'landing page',
        description: 'Односторінковий сайт без додаткових розділів.',
    },
};

export const CHECK_CONFIG: CheckConfig = {
    return_policy: {
        message: 'Відсутня інформація про повернення товару',
        icon: 'icons/return_policy.svg',
        label: 'Повернення',
        values: {
            passed: 'знайдено',
            failed: 'не знайдено'
        },
    },
    warranty: {
        message: 'Немає інформації про гарантію',
        icon: 'icons/warranty.svg',
        label: 'Гарантія',
        values: {
            passed: 'знайдено',
            failed: 'не знайдено'
        }
    },
    contacts: {
        message: 'Відсутня контактна інформація',
        icon: 'icons/contacts.svg',
        label: 'Контакти',
        values: {
            passed: 'присутні',
            failed: 'відсутні'
        }
    },
    legal_info: {
        message: 'Немає юридичних даних продавця',
        icon: 'icons/legal_info.svg',
        label: 'Юридичні дані',
        values: {
            passed: 'присутні',
            failed: 'відсутні'
        }
    },
    aggressive_marketing: {
        message: 'Агресивні маркетингові формулювання',
        icon: 'icons/aggressive_marketing.svg',
        label: 'Агресивний маркетинг',
        values: {
            passed: "не виявлено",
            failed: "виявлено"
        }
    },
    name_and_phone_only_form: {
        message: 'Форма без інформації про доставку',
        icon: 'icons/name_and_phone_only_form.svg',
        label: 'Форма замовлення',
        values: {
            passed: "повна",
            failed: "лише ім'я та телефон"
        }
    },
    domain_zone: {
        message: 'Потенційно підозріла доменна зона',
        icon: 'icons/domain_zone.svg',
        label: 'Доменна зона',
        values: {
            passed: "типова",
            failed: "підозріла"
        }
    }
};

export const RISK_LEVEL_CONFIG: RiskLevelConfig = {
    high: {
        label: 'Високий ризик',
        description: 'Виявлено кілька підозрілих ознак на цьому сайті.',
        theme: 'high',
        icon: 'icons/icon-red.svg',
    },
    medium: {
        label: 'Середній ризик',
        description: 'Виявлено деякі ознаки, що можуть свідчити про ризики.',
        theme: 'medium',
        icon: 'icons/icon-amber.svg',
    },
    low: {
        label: 'Низький ризик',
        description: 'Сайт виглядає безпечно. Підозрілих ознак не виявлено.',
        theme: 'low',
        icon: 'icons/icon-green.svg',
    },
};