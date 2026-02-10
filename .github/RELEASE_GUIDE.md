# 发布流程快速指南

## 🚀 一键发布

```bash
pnpm release
```

这条命令会：
1. 更新所有包的版本号
2. 创建 git commit 和 tag
3. 推送到 GitHub
4. 触发自动发布到 NPM

## 📋 发布步骤详解

### 步骤 1: 准备发布

```bash
# 确保在 main 分支
git checkout main
git pull

# 运行完整测试
pnpm test
pnpm lint
pnpm typecheck
```

### 步骤 2: 更新版本

```bash
pnpm release
```

bumpp 会提示你选择版本类型：
- `patch` (0.0.x) - Bug 修复
- `minor` (0.x.0) - 新功能
- `major` (x.0.0) - 破坏性变更
- `custom` - 自定义版本号

### 步骤 3: 自动发布

tag 推送后，GitHub Actions 会自动：
- ✅ 运行所有检查
- 📦 构建包
- 🚀 发布到 NPM
- 📝 生成 Release Notes

查看进度：https://github.com/ZWkang/json-render-vue/actions

## ⚙️ 首次发布配置

### 配置 NPM Token

1. 创建 NPM Token (https://www.npmjs.com/settings/YOUR_USERNAME/tokens):
   - Type: **Automation**
   - 复制生成的 token

2. 添加到 GitHub Secrets:
   - 进入: Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `NPM_TOKEN`
   - Value: 你的 token

### 确认包名可用

检查 NPM 上包名是否可用：
- https://www.npmjs.com/package/json-render-vue
- https://www.npmjs.com/package/@zwkang-dev/json-render-tdesign-vue-next

如果包名被占用，需要修改 `packages/*/package.json` 中的 `name` 字段。

## 🔍 监控发布状态

### GitHub Actions
查看: https://github.com/ZWkang/json-render-vue/actions

### NPM 包页面
- json-render-vue: https://www.npmjs.com/package/json-render-vue
- @zwkang-dev/json-render-tdesign-vue-next: https://www.npmjs.com/package/@zwkang-dev/json-render-tdesign-vue-next

## 🛠️ 常用命令

```bash
# 查看当前版本
pnpm -r exec npm version

# 发布 beta 版本
pnpm release --preid beta

# 手动发布（紧急情况）
pnpm build
pnpm publish:ci

# 查看哪些包会被发布
pnpm -r exec npm pack --dry-run
```

## ❓ 常见问题

**Q: 发布失败了？**
1. 检查 GitHub Actions 日志
2. 确认 NPM_TOKEN 配置正确
3. 确认包名没有被占用
4. 尝试手动发布 `pnpm publish:ci`

**Q: 如何回滚版本？**
NPM 不支持删除版本，只能 deprecate:
```bash
npm deprecate json-render-vue@x.x.x "Please use x.x.y instead"
```

**Q: 如何发布特定包？**
```bash
cd packages/json-render-vue
pnpm publish --access public
```

## 📚 完整文档

详细文档请查看 [RELEASE.md](./RELEASE.md)
