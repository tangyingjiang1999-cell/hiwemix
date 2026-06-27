// 应用指南数据结构
export interface GuideItem {
  id: string;
  title: string;
  titleZh: string;
  category: string;
  content: string;
  contentZh: string;
}

export interface GuideCategory {
  id: string;
  name: string;
  nameZh: string;
}

// 指南分类
export const guideCategories: GuideCategory[] = [
  { id: "surface", name: "Surface Preparation", nameZh: "表面处理" },
  { id: "mixing", name: "Color Mixing", nameZh: "调漆技巧" },
  { id: "spraying", name: "Spraying Technique", nameZh: "喷涂技术" },
  { id: "drying", name: "Drying & Curing", nameZh: "干燥与固化" },
  { id: "troubleshooting", name: "Troubleshooting", nameZh: "故障排除" },
];

// 指南数据
export const guideItems: GuideItem[] = [
  {
    id: "guide-001",
    title: "Surface Cleaning Before Painting",
    titleZh: "喷涂前表面清洁",
    category: "surface",
    content: `Proper surface cleaning is critical for paint adhesion.

Steps:
1. Wash the surface with degreaser
2. Rinse with clean water
3. Dry completely
4. Wipe with tack cloth

Tips: Always wear gloves to avoid contaminating the surface with skin oils.`,
    contentZh: `正确的表面清洁对于油漆附着力至关重要。

步骤：
1. 使用除油剂清洗表面
2. 用清水冲洗干净
3. 完全干燥
4. 使用粘尘布擦拭

提示：始终佩戴手套，避免皮肤油脂污染表面。`,
  },
  {
    id: "guide-002",
    title: "How to Mix Metallic Paint",
    titleZh: "如何调配金属漆",
    category: "mixing",
    content: `Metallic paints contain aluminum flakes that need proper dispersion.

Key points:
1. Stir slowly to avoid breaking flakes
2. Use a scale for accurate measurement
3. Add binder gradually while stirring
4. Let the mixture rest for 10 minutes before use

Warning: Never use high-speed mixers as they can damage metallic flakes.`,
    contentZh: `金属漆含有需要正确分散的铝片。

关键点：
1. 缓慢搅拌，避免打破 flakes
2. 使用电子秤精确测量
3. 边搅拌边逐渐加入树脂
4. 使用前让混合物静置10分钟

警告：切勿使用高速搅拌器，会损坏金属片。`,
  },
  {
    id: "guide-003",
    title: "Spray Gun Setup for Base Coat",
    titleZh: "底漆喷枪设置",
    category: "spraying",
    content: `Proper spray gun setup ensures consistent coverage.

Recommended settings:
- Nozzle size: 1.3-1.4mm
- Air pressure: 2.0-2.5 bar
- Spray distance: 15-20cm
- Overlap: 50-70%

Technique: Apply 2-3 coats with flash time between coats.`,
    contentZh: `正确的喷枪设置确保覆盖均匀。

推荐设置：
- 喷嘴尺寸：1.3-1.4mm
- 气压：2.0-2.5 bar
- 喷涂距离：15-20cm
- 重叠：50-70%

技巧：喷涂2-3遍，每遍之间留有闪蒸时间。`,
  },
  {
    id: "guide-004",
    title: "Drying Time and Temperature",
    titleZh: "干燥时间与温度",
    category: "drying",
    content: `Temperature and humidity affect drying time significantly.

Guidelines:
- 20°C: 30 minutes between coats
- 25°C: 20 minutes between coats
- Below 15°C: Use infrared lamp

Never force-dry within the first 10 minutes as it can cause solvent popping.`,
    contentZh: `温度和湿度会显著影响干燥时间。

指导原则：
- 20°C：每遍之间30分钟
- 25°C：每遍之间20分钟
- 低于15°C：使用红外线灯

切勿在前10分钟内强制干燥，会导致溶剂泡。`,
  },
  {
    id: "guide-005",
    title: "Fixing Orange Peel Effect",
    titleZh: "修复橘皮效应",
    category: "troubleshooting",
    content: `Orange peel effect is caused by improper spray technique or wrong thinner.

Solutions:
1. Increase spray distance slightly
2. Use slower thinner in hot weather
3. Apply final coat with more fluid
4. Wet sand and polish after curing

Prevention: Practice on test panels before working on actual parts.`,
    contentZh: `橘皮效应由不正确的喷涂技术或错误的稀释剂引起。

解决方案：
1. 稍微增加喷涂距离
2. 热天使用慢干稀释剂
3. 最后一遍喷涂时使用更多漆料
4. 固化后水磨和抛光

预防：在实际部件上工作前，先在测试板上练习。`,
  },
];
