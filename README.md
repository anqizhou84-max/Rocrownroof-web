# Rocrown Roofing Materials Website

Static multilingual B2B website for Rocrown roofing materials, focused on ASA
synthetic resin roof tile, PVC roof sheet, UPVC hollow roof sheet, aluminium
sandwich panel, and clear transparent roof sheet.

## Pages

- `/en/` English homepage
- `/es/` Spanish homepage
- `/fr/` French homepage
- `/ar/` Arabic homepage with RTL layout
- `/ru/` Russian homepage
- `/zh/` Chinese homepage
- `/en/inquiry.html` and matching language inquiry pages

## Local Preview

```bash
python3 -m http.server 6173
```

Then open:

```text
http://127.0.0.1:6173/en/
```

## i18n

Language dictionaries are stored in `/locales/*.json`. The frontend i18n runtime
is in `/i18n.js` and supports:

- language path detection
- localStorage language memory
- English fallback
- automatic `html lang`
- RTL direction for Arabic
- localized SEO title and description updates

Canonical and hreflang URLs are set directly in the HTML. When adding a
language or page, update the matching alternate links and `sitemap.xml`.
The root homepage and root inquiry aliases point to their English equivalents
and are intentionally excluded from the sitemap.

## 内容后台（Pages CMS）

[打开 Pages CMS](https://app.pagescms.org/)，使用 GitHub 登录。首次设置时，
将 Pages CMS GitHub App 的访问范围限定在
`anqizhou84-max/Rocrownroof-web`，再打开仓库的 `main` 分支。
仓库内的 `.pages.yml` 已预设管理界面，无需在后台重新创建配置。

- **多语言内容**：分别编辑六种语言的首页 H1、产品介绍、导航、询盘页文案和 SEO 标题、描述。保存不会自动翻译其他语言。
- **首页图片（所有语言）**：从图库选择或上传图片后，保存对应字段。产品图同时用于首页产品卡和 Products 超级菜单。上传后生成安全的英文文件名，建议使用 JPG、PNG 或 WebP。
- **发布**：保存会写入 GitHub 仓库。GitHub Pages 完成重新部署后，可在网站上核对对应语言。保留仍在页面使用的旧图片，不要直接删除。

当前 SEO 文字和新图片通过网站现有的前端脚本加载。CMS 不会重写 HTML 源码里的默认文案，也不改动 URL、canonical 或 hreflang。此后台不储存客户询盘、密码或其他私密数据，博客发布和询盘收件不在本次接入范围内。
