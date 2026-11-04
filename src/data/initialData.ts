import { ACRecord } from '../types';
import { recalculateAllRecords } from '../utils/calculations';

export const INITIAL_CSV_RAW = `CutoffDate,KW_CutOff,KW_Month,KW_Statement,RatePerKwh,Bill,CycleDays,AveCost_Day,OffsetDays,TotalDue,Payment,Balance
2024-06-21,33.68,50.26,33.68,,0,21,0,,0,,0
2024-07-23,28.64,38.19,45.22,13.29,600.97,32,18.78,,600.97,600,0.97
2024-08-21,38.89,56.15,48.44,13.34,646.19,29,22.28,,647.16,650,-2.84
2024-09-22,30.15,47.75,47.41,13.52,640.98,32,20.03,,638.14,650,-11.86
2024-10-21,35.71,43.17,53.31,13.13,699.96,29,24.14,,688.1,700,-11.9
2024-11-21,27.59,38.35,35.05,13.07,458.1,31,14.78,,446.2,400,46.2
2024-12-21,20.63,27.01,31.39,13.21,414.66,30,13.82,,460.86,450,10.86
2025-01-21,18.94,26.8,25.32,12.59,318.78,31,10.28,,329.64,350,-20.36
2025-02-21,16.73,21.15,24.59,12.90,317.21,31,10.23,,296.85,300,-3.15
2025-03-21,26.2,39.87,30.62,13.12,401.73,28,14.35,,398.58,400,-1.42
2025-04-21,37.24,59.98,52.68,14.36,756.48,31,24.4,1,755.06,800,-44.94
2025-05-21,49.57,70.68,72.31,13.58,981.97,30,32.73,,937.03,1000,-62.97
2025-06-21,37.64,50.55,58.75,13.50,793.13,31,25.58,,730.16,700,30.16
2025-07-21,23.19,29.06,36.1,13.48,486.63,30,16.22,,516.79,500,16.79
2025-08-21,33.4,49.31,39.27,14.09,553.31,31,17.85,,570.1,600,-29.9
2025-09-21,14.68,22.34,35.48,13.93,494.24,31,15.94,7,464.34,500,-35.66
2025-10-21,22.86,37.88,30.52,14.18,432.77,30,14.43,,397.11,500,-102.89
2025-11-21,25.32,36.73,40.34,14.30,576.86,31,18.61,,473.97,500,-26.03
2025-12-21,19.41,29.45,30.82,13.97,430.56,30,14.35,,404.53,500,-95.47
2026-01-21,17.56,21.69,27.6,13.80,380.88,31,12.29,,285.41,500,-214.59
2026-02-21,19.18,29.65,23.31,13.50,314.69,31,10.15,,100.1,500,-399.91
2026-03-21,22.68,37.92,33.15,14.45,479.02,28,17.11,,79.11,500,-420.89
2026-04-21,37.9,57.31,53.14,15.55,826.33,31,26.66,,405.44,500,-94.56
2026-05-21,46.42,73.3,65.83,15.52,1021.68,30,34.06,,927.12,1000,-72.88
2026-06-21,42.34,59.57,69.22,15.67,1084.68,31,34.99,,1011.8,1000,11.8
2026-07-21,18.73,34.07,43.99,16.02,704.72,30,23.49,9,716.52,800,-83.48
2026-08-21,17.32,31.9,32.66,15.43,503.94,31,16.26,0,420.46,500,-79.54
2026-09-21,26.27,0,40.85,,630.32,31,20.33,0,550.78,0,550.78`;

export const INITIAL_RECORDS: ACRecord[] = recalculateAllRecords([
  { CutoffDate: '2024-06-21', KW_CutOff: 33.68, KW_Month: 50.26, KW_Statement: 33.68, RatePerKwh: null, Bill: 0, CycleDays: 21, AveCost_Day: 0, OffsetDays: 0, TotalDue: 0, Payment: 0, Balance: 0 },
  { CutoffDate: '2024-07-23', KW_CutOff: 28.64, KW_Month: 38.19, KW_Statement: 45.22, RatePerKwh: 13.29, Bill: 600.97, CycleDays: 32, AveCost_Day: 18.78, OffsetDays: 0, TotalDue: 600.97, Payment: 600, Balance: 0.97 },
  { CutoffDate: '2024-08-21', KW_CutOff: 38.89, KW_Month: 56.15, KW_Statement: 48.44, RatePerKwh: 13.34, Bill: 646.19, CycleDays: 29, AveCost_Day: 22.28, OffsetDays: 0, TotalDue: 647.16, Payment: 650, Balance: -2.84 },
  { CutoffDate: '2024-09-22', KW_CutOff: 30.15, KW_Month: 47.75, KW_Statement: 47.41, RatePerKwh: 13.52, Bill: 640.98, CycleDays: 32, AveCost_Day: 20.03, OffsetDays: 0, TotalDue: 638.14, Payment: 650, Balance: -11.86 },
  { CutoffDate: '2024-10-21', KW_CutOff: 35.71, KW_Month: 43.17, KW_Statement: 53.31, RatePerKwh: 13.13, Bill: 699.96, CycleDays: 29, AveCost_Day: 24.14, OffsetDays: 0, TotalDue: 688.1, Payment: 700, Balance: -11.9 },
  { CutoffDate: '2024-11-21', KW_CutOff: 27.59, KW_Month: 38.35, KW_Statement: 35.05, RatePerKwh: 13.07, Bill: 458.1, CycleDays: 31, AveCost_Day: 14.78, OffsetDays: 0, TotalDue: 446.2, Payment: 400, Balance: 46.2 },
  { CutoffDate: '2024-12-21', KW_CutOff: 20.63, KW_Month: 27.01, KW_Statement: 31.39, RatePerKwh: 13.21, Bill: 414.66, CycleDays: 30, AveCost_Day: 13.82, OffsetDays: 0, TotalDue: 460.86, Payment: 450, Balance: 10.86 },
  { CutoffDate: '2025-01-21', KW_CutOff: 18.94, KW_Month: 26.8, KW_Statement: 25.32, RatePerKwh: 12.59, Bill: 318.78, CycleDays: 31, AveCost_Day: 10.28, OffsetDays: 0, TotalDue: 329.64, Payment: 350, Balance: -20.36 },
  { CutoffDate: '2025-02-21', KW_CutOff: 16.73, KW_Month: 21.15, KW_Statement: 24.59, RatePerKwh: 12.9, Bill: 317.21, CycleDays: 31, AveCost_Day: 10.23, OffsetDays: 0, TotalDue: 296.85, Payment: 300, Balance: -3.15 },
  { CutoffDate: '2025-03-21', KW_CutOff: 26.2, KW_Month: 39.87, KW_Statement: 30.62, RatePerKwh: 13.12, Bill: 401.73, CycleDays: 28, AveCost_Day: 14.35, OffsetDays: 0, TotalDue: 398.58, Payment: 400, Balance: -1.42 },
  { CutoffDate: '2025-04-21', KW_CutOff: 37.24, KW_Month: 59.98, KW_Statement: 52.68, RatePerKwh: 14.36, Bill: 756.48, CycleDays: 31, AveCost_Day: 24.4, OffsetDays: 1, TotalDue: 755.06, Payment: 800, Balance: -44.94 },
  { CutoffDate: '2025-05-21', KW_CutOff: 49.57, KW_Month: 70.68, KW_Statement: 72.31, RatePerKwh: 13.58, Bill: 981.97, CycleDays: 30, AveCost_Day: 32.73, OffsetDays: 0, TotalDue: 937.03, Payment: 1000, Balance: -62.97 },
  { CutoffDate: '2025-06-21', KW_CutOff: 37.64, KW_Month: 50.55, KW_Statement: 58.75, RatePerKwh: 13.5, Bill: 793.13, CycleDays: 31, AveCost_Day: 25.58, OffsetDays: 0, TotalDue: 730.16, Payment: 700, Balance: 30.16 },
  { CutoffDate: '2025-07-21', KW_CutOff: 23.19, KW_Month: 29.06, KW_Statement: 36.1, RatePerKwh: 13.48, Bill: 486.63, CycleDays: 30, AveCost_Day: 16.22, OffsetDays: 0, TotalDue: 516.79, Payment: 500, Balance: 16.79 },
  { CutoffDate: '2025-08-21', KW_CutOff: 33.4, KW_Month: 49.31, KW_Statement: 39.27, RatePerKwh: 14.09, Bill: 553.31, CycleDays: 31, AveCost_Day: 17.85, OffsetDays: 0, TotalDue: 570.1, Payment: 600, Balance: -29.9 },
  { CutoffDate: '2025-09-21', KW_CutOff: 14.68, KW_Month: 22.34, KW_Statement: 35.48, RatePerKwh: 13.93, Bill: 494.24, CycleDays: 31, AveCost_Day: 15.94, OffsetDays: 7, TotalDue: 464.34, Payment: 500, Balance: -35.66 },
  { CutoffDate: '2025-10-21', KW_CutOff: 22.86, KW_Month: 37.88, KW_Statement: 30.52, RatePerKwh: 14.18, Bill: 432.77, CycleDays: 30, AveCost_Day: 14.43, OffsetDays: 0, TotalDue: 397.11, Payment: 500, Balance: -102.89 },
  { CutoffDate: '2025-11-21', KW_CutOff: 25.32, KW_Month: 36.73, KW_Statement: 40.34, RatePerKwh: 14.3, Bill: 576.86, CycleDays: 31, AveCost_Day: 18.61, OffsetDays: 0, TotalDue: 473.97, Payment: 500, Balance: -26.03 },
  { CutoffDate: '2025-12-21', KW_CutOff: 19.41, KW_Month: 29.45, KW_Statement: 30.82, RatePerKwh: 13.97, Bill: 430.56, CycleDays: 30, AveCost_Day: 14.35, OffsetDays: 0, TotalDue: 404.53, Payment: 500, Balance: -95.47 },
  { CutoffDate: '2026-01-21', KW_CutOff: 17.56, KW_Month: 21.69, KW_Statement: 27.6, RatePerKwh: 13.8, Bill: 380.88, CycleDays: 31, AveCost_Day: 12.29, OffsetDays: 0, TotalDue: 285.41, Payment: 500, Balance: -214.59 },
  { CutoffDate: '2026-02-21', KW_CutOff: 19.18, KW_Month: 29.65, KW_Statement: 23.31, RatePerKwh: 13.5, Bill: 314.69, CycleDays: 31, AveCost_Day: 10.15, OffsetDays: 0, TotalDue: 100.1, Payment: 500, Balance: -399.91 },
  { CutoffDate: '2026-03-21', KW_CutOff: 22.68, KW_Month: 37.92, KW_Statement: 33.15, RatePerKwh: 14.45, Bill: 479.02, CycleDays: 28, AveCost_Day: 17.11, OffsetDays: 0, TotalDue: 79.11, Payment: 500, Balance: -420.89 },
  { CutoffDate: '2026-04-21', KW_CutOff: 37.9, KW_Month: 57.31, KW_Statement: 53.14, RatePerKwh: 15.55, Bill: 826.33, CycleDays: 31, AveCost_Day: 26.66, OffsetDays: 0, TotalDue: 405.44, Payment: 500, Balance: -94.56 },
  { CutoffDate: '2026-05-21', KW_CutOff: 46.42, KW_Month: 73.3, KW_Statement: 65.83, RatePerKwh: 15.52, Bill: 1021.68, CycleDays: 30, AveCost_Day: 34.06, OffsetDays: 0, TotalDue: 927.12, Payment: 1000, Balance: -72.88 },
  { CutoffDate: '2026-06-21', KW_CutOff: 42.34, KW_Month: 59.57, KW_Statement: 69.22, RatePerKwh: 15.67, Bill: 1084.68, CycleDays: 31, AveCost_Day: 34.99, OffsetDays: 0, TotalDue: 1011.8, Payment: 1000, Balance: 11.8 },
  { CutoffDate: '2026-07-21', KW_CutOff: 18.73, KW_Month: 34.07, KW_Statement: 43.99, RatePerKwh: 16.02, Bill: 704.72, CycleDays: 30, AveCost_Day: 23.49, OffsetDays: 9, TotalDue: 716.52, Payment: 800, Balance: -83.48 },
  { CutoffDate: '2026-08-21', KW_CutOff: 17.32, KW_Month: 31.9, KW_Statement: 32.66, RatePerKwh: 15.43, Bill: 503.94, CycleDays: 31, AveCost_Day: 16.26, OffsetDays: 0, TotalDue: 420.46, Payment: 500, Balance: -79.54 },
  { CutoffDate: '2026-09-21', KW_CutOff: 26.27, KW_Month: 0, KW_Statement: 40.85, RatePerKwh: null, Bill: 630.32, CycleDays: 31, AveCost_Day: 20.33, OffsetDays: 0, TotalDue: 550.78, Payment: 0, Balance: 550.78 },
]);
