import TableCell from "@mui/material/TableCell";
import type { SxProps, Theme } from "@mui/material/styles";
import { getCellSx, COLUMN_BG } from "./admin-table-styles";

interface AdminTableCellProps {
  colIndex: number;
  rowIndex: number;
  width?: number;
  colBg?: { odd: string; even: string };
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function AdminTableCell({
  colIndex,
  rowIndex,
  width,
  colBg = COLUMN_BG,
  children,
  sx = {},
}: AdminTableCellProps) {
  const cellStyles = getCellSx(colIndex, rowIndex, colBg.odd, colBg.even);

  return (
    <TableCell
      sx={{
        ...cellStyles,
        width,
        ...sx,
      }}
    >
      {children}
    </TableCell>
  );
}
