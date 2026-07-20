// 辅料（Supplementary Materials）— 12 条
import type { Toner } from '@/types';

const tonersSupplementary: Toner[] = [
  { code: 'SUP-6001', tradeName: 'Hardener (Fast)', nameZh: '快干固化剂', category: 'SUPPLEMENTARY', hex: '#E8E8E8' },
  { code: 'SUP-6002', tradeName: 'Hardener (Standard)', nameZh: '标准固化剂', category: 'SUPPLEMENTARY', hex: '#F0F0F0' },
  { code: 'SUP-6003', tradeName: 'Hardener (Slow)', nameZh: '慢干固化剂', category: 'SUPPLEMENTARY', hex: '#F5F5F5' },
  { code: 'SUP-6004', tradeName: 'Thinner (Fast)', nameZh: '快干稀释剂', category: 'SUPPLEMENTARY', hex: '#FAFAFA' },
  { code: 'SUP-6005', tradeName: 'Thinner (Standard)', nameZh: '标准稀释剂', category: 'SUPPLEMENTARY', hex: '#FCFCFC' },
  { code: 'SUP-6006', tradeName: 'Thinner (Slow)', nameZh: '慢干稀释剂', category: 'SUPPLEMENTARY', hex: '#F8F8F8' },
  { code: 'SUP-6007', tradeName: 'Clear Coat (High Gloss)', nameZh: '高光清漆', category: 'SUPPLEMENTARY', hex: '#E0E8F0' },
  { code: 'SUP-6008', tradeName: 'Clear Coat (Matte)', nameZh: '哑光清漆', category: 'SUPPLEMENTARY', hex: '#D8D8E0' },
  { code: 'SUP-6009', tradeName: 'Adhesion Promoter', nameZh: '附着力促进剂/塑料底漆', category: 'SUPPLEMENTARY', hex: '#FFF8DC' },
  { code: 'SUP-6010', tradeName: 'Primer (Grey)', nameZh: '中涂底漆（灰）', category: 'SUPPLEMENTARY', hex: '#C0C0C0' },
  { code: 'SUP-6011', tradeName: 'Primer (White)', nameZh: '中涂底漆（白）', category: 'SUPPLEMENTARY', hex: '#E8E8E8' },
  { code: 'SUP-6012', tradeName: 'Flex Additive', nameZh: '柔软添加剂/保险杠专用', category: 'SUPPLEMENTARY', hex: '#FFF0E0' },
];

export default tonersSupplementary;
