import type { Meta } from '@sly-cli/sly'


export default function transformIcon(input: String, meta: Meta) {
    const inputInfo = prependLicenceIcon(input, meta)

    return inputInfo;
}

function prependLicenceIcon(input: String, meta: Meta) {
    return [
        `<!-- Downloaded from ${meta.name} -->`,
        `<!-- License ${meta.license} -->`,
        `<!-- ${meta.source} -->`,
        input,
    ].join('\n');
}