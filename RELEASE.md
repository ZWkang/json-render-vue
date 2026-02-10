# 发布流程

本项目使用 **bumpp** 进行版本管理和发布，遵循 antfu 风格的简单发布流程。

## 快速发布

```bash
# 1. 确保所有改动已提交
git status

# 2. 运行测试确保一切正常
pnpm test

# 3. 运行 release 命令（会自动更新版本、创建 tag 并推送）
pnpm release
```

`pnpm release` 会：
- 🔢 提示你选择版本号（patch/minor/major 或自定义）
- ✍️ 更新所有包的版本号
- 📝 创建 git commit
- 🏷️ 创建 git tag (格式: v1.2.3)
- 🚀 推送到 GitHub（包括 tag）

## GitHub Actions 自动发布

当 tag 被推送到 GitHub 后，会自动触发发布流程：

1. ✅ 运行 lint
2. ✅ 运行 typecheck
3. ✅ 运行所有测试
4. 📦 构建所有包
5. 📤 发布到 NPM（需要配置 `NPM_TOKEN`）
6. 📋 生成 GitHub Release Notes

## 配置 NPM Token

首次发布前需要在 GitHub 配置 NPM token：

1. 在 NPM 创建 Access Token：
   - 登录 https://www.npmjs.com
   - 点击头像 → Access Tokens → Generate New Token
   - 选择 "Automation" 类型
   - 复制生成的 token

2. 在 GitHub 配置 Secret：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 NPM token
   - 点击 "Add secret"

## 版本号规范

遵循 [Semantic Versioning](https://semver.org/) 规范：

- **Patch** (0.0.x): Bug 修复，向后兼容
- **Minor** (0.x.0): 新功能，向后兼容
- **Major** (x.0.0): 破坏性变更，不向后兼容

## 发布前检查清单

- [ ] 所有测试通过 (`pnpm test`)
- [ ] 代码已 lint (`pnpm lint`)
- [ ] 类型检查通过 (`pnpm typecheck`)
- [ ] 构建成功 (`pnpm build`)
- [ ] 更新了相关文档
- [ ] 所有改动已提交到 git

## 手动发布（紧急情况）

如果自动发布失败，可以手动发布：

```bash
# 1. 构建
pnpm build

# 2. 发布（会跳过 git 检查）
pnpm publish:ci
```

注意：手动发布需要本地配置好 NPM 登录：
```bash
npm login
```

## CI/CD 流程

### CI (每次 push/PR)
- Lint 代码
- TypeScript 类型检查
- 运行测试（Node 18 & 20）
- 构建所有包

### Release (tag push)
- 完整的 CI 检查
- 构建所有包
- 发布到 NPM（带 provenance）
- 生成 Release Notes

## 常见问题

### Q: 如何发布 beta 版本？

```bash
# 使用 bumpp 的 preid 选项
pnpm release --preid beta
# 例如: 1.0.0 → 1.0.1-beta.0
```

### Q: 如何回滚发布？

```bash
# NPM 不支持删除已发布的版本，但可以 deprecate
npm deprecate json-render-vue@1.2.3 "This version has bugs, please use 1.2.4"
```

### Q: 发布失败了怎么办？

1. 检查 GitHub Actions 日志
2. 确认 NPM_TOKEN 是否正确配置
3. 确认包名是否可用（没有被占用）
4. 尝试手动发布

### Q: 如何只发布某个包？

```bash
# 进入包目录
cd packages/json-render-vue

# 手动发布
pnpm publish --access public
```

## 相关命令

```bash
# 查看当前版本
pnpm -r exec npm version

# 构建所有包
pnpm build

# 运行所有测试
pnpm test

# Lint 代码
pnpm lint

# 类型检查
pnpm typecheck

# 更新依赖
pnpm update:deps
```

## 参考

- [bumpp](https://github.com/antfu/bumpp) - 版本管理工具
- [changelogithub](https://github.com/antfu/changelogithub) - GitHub Release Notes 生成器
- [Semantic Versioning](https://semver.org/) - 语义化版本规范
