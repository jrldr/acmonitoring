<?php
$csvFile = 'data.csv';$headers = ['CutoffDate', 'KW_CutOff', 'KW_Month', 'KW_Statement', 'RatePerKwh', 'Bill', 'CycleDays', 'AveCost_Day', 'OffsetDays', 'TotalDue', 'Payment', 'Balance'];

// Initialize/Read CSV
$records = [];
if (file_exists($csvFile)) {
    if (($handle = fopen($csvFile, "r")) !== FALSE) {
        $fileHeaders = fgetcsv($handle);
        if ($fileHeaders and count($fileHeaders) == count($headers)) {
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($headers) == count($data)) {$records[] = array_combine($headers,$data);
                }
            }
        }
        fclose($handle);
    }
    // Always sort chronologically when reading
    usort($records, function($a,$b) {
        return strtotime($a['CutoffDate']) - strtotime($b['CutoffDate']);
    });
}

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' and isset($_POST['action'])) {
    if ($_POST['action'] === 'save') {
        $cutoffDate =$_POST['CutoffDate'];
        $old_date = isset($_POST['old_date']) ? $_POST['old_date'] : '';$new_record = [
            'CutoffDate' => $cutoffDate,
            'KW_CutOff' => $_POST['KW_CutOff'],
            'KW_Month' => !empty($_POST['KW_Month']) ? $_POST['KW_Month'] : 0,
            'KW_Statement' => 0, 
            'RatePerKwh' =>$_POST['RatePerKwh'],
            'Bill' => 0,
            'CycleDays' => 0,
            'AveCost_Day' => 0,
            'OffsetDays' => !empty($_POST['OffsetDays']) ?$_POST['OffsetDays'] : 0,
            'TotalDue' => 0,
            'Payment' => !empty($_POST['Payment']) ?$_POST['Payment'] : 0,
            'Balance' => 0
        ];

        if (!empty($old_date)) {
            $records = array_filter($records, function($r) use ($old_date) {
                return $r['CutoffDate'] !==$old_date;
            });
        }
        
        $records[] =$new_record;
        
        usort($records, function($a,$b) {
            return strtotime($a['CutoffDate']) - strtotime($b['CutoffDate']);
        });

        $effective_rate_prev = 0;
        $records = array_values($records); 
        
        foreach ($records as $i => &$row) {
            $prev_KW_Month = ($i > 0) ? (float)$records[$i-1]['KW_Month'] : 0;
            $prev_KW_CutOff = ($i > 0) ? (float)$records[$i-1]['KW_CutOff'] : 0;
            
            $curr_KW_CutOff = (float)$row['KW_CutOff'];
            $offset_days = (float)$row['OffsetDays'];
            
            $current_time = strtotime($row['CutoffDate']);
            $days_start_to_cutoff = (int)date('j',$current_time);
            if ($days_start_to_cutoff == 0) {$days_start_to_cutoff = 1; }

            // KW_Statement
            $kw_statement = ($prev_KW_Month -$prev_KW_CutOff) + $curr_KW_CutOff + ($offset_days * ($curr_KW_CutOff / $days_start_to_cutoff));
            $row['KW_Statement'] = round($kw_statement, 2);

            // CycleDays
            if ($i > 0) {
                $prev_time = strtotime($records[$i-1]['CutoffDate']);$cycle_days = (int)round(abs($current_time -$prev_time) / 86400); 
            } else {
                $cycle_days =$days_start_to_cutoff;
            }
            if ($cycle_days == 0) {$cycle_days = 1; }
            $row['CycleDays'] =$cycle_days;

            // Rate & Bill
            $rate = trim($row['RatePerKwh']);
            
            if (empty($rate) or$rate == '0') {
                $used_rate =$effective_rate_prev;
            } else {
                $used_rate = (float)$rate;
                $effective_rate_prev =$used_rate;
            }
            $row['RatePerKwh'] =$rate; 
            
            $bill = $row['KW_Statement'] *$used_rate;
            $row['Bill'] = round($bill, 2);
            
            // AveCost_Day$row['AveCost_Day'] = round($bill / $cycle_days, 2);

            // TotalDue & Balance
            $prev_balance = ($i > 0) ? (float)$records[$i-1]['Balance'] : 0;
            $total_due = $bill +$prev_balance;
            $row['TotalDue'] = round($total_due, 2);$payment = (float)$row['Payment'];$row['Balance'] = round($total_due -$payment, 2);
        }
        unset($row);

        $fp = fopen($csvFile, 'w');
        fputcsv($fp,$headers);
        foreach ($records as $r) {$row_data = [];
            foreach ($headers as $col) {$row_data[] = isset($r[$col]) ? $r[$col] : '';
            }
            fputcsv($fp,$row_data);
        }
        fclose($fp);
        
        header("Location: index.php");
        exit;
    }
}

// Prepare Dashboard Variables safely
$latestRecord = end($records);$currentDue = !empty($latestRecord['TotalDue']) ? (float)$latestRecord['TotalDue'] : 0;
$latestBill = !empty($latestRecord['Bill']) ? (float)$latestRecord['Bill'] : 0;
$latestBalance = !empty($latestRecord['Balance']) ? (float)$latestRecord['Balance'] : 0;
$latestAveCost = !empty($latestRecord['AveCost_Day']) ? (float)$latestRecord['AveCost_Day'] : 0;
$latestKwStatement = !empty($latestRecord['KW_Statement']) ? (float)$latestRecord['KW_Statement'] : 0;

// Prepare Chart Data (Strictly 1 Year Span based on latest record)
$chartLabels = [];$chartData = [];

if (!empty($records)) {
    $latestDateStr =$latestRecord['CutoffDate'];
    $oneYearAgo = strtotime('-12 months', strtotime($latestDateStr));

    foreach ($records as$r) {
        $recordTime = strtotime($r['CutoffDate']);
        if ($recordTime >=$oneYearAgo) { 
            $chartLabels[] = date('M Y',$recordTime); 
            $chartData[] = (float)$r['KW_Statement'];
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<link rel="manifest" href="manifest.json">
	<meta name="theme-color" content="#6366f1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>AC Dashboard — Power Tracker</title>
    <style>
        /* CSS Variables for Sleek Light/Dark Themes */
        :root {
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --primary-light: rgba(99, 102, 241, 0.1);
            --success: #10b981;
            --danger: #ef4444;
            
            /* Light Theme Defaults */
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --input-bg: #f1f5f9;
            --row-hover: #f8fafc;
            --modal-overlay: rgba(15, 23, 42, 0.5);
            
            --due-bg: #fef2f2;
            --pay-bg: #f0fdf4;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            --card-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08);
        }

        /* Dark Theme Overrides */
        [data-theme="dark"] {
            --bg: #090d16;
            --card-bg: #111827;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
            --border: #1f2937;
            --input-bg: #1f2937;
            --row-hover: #172033;
            --modal-overlay: rgba(3, 7, 18, 0.7);
            
            --due-bg: #451a03;
            --pay-bg: #064e3b;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            --card-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background-color: var(--bg); color: var(--text-main); padding: 20px; padding-bottom: 90px; transition: background-color 0.3s ease, color 0.3s ease; }
        
        .container { max-width: 1200px; margin: 0 auto; }

        /* Header Styling */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .header-brand { display: flex; align-items: center; gap: 10px; }
        .header-logo { width: 36px; height: 36px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        .header h2 { font-size: 20px; font-weight: 700; color: var(--text-main); letter-spacing: -0.025em; }
        .header-actions { display: flex; gap: 10px; align-items: center; }
        
        /* Buttons */
        .btn { padding: 9px 16px; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25); }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .btn-outline { background: var(--card-bg); border: 1px solid var(--border); color: var(--text-main); padding: 8px 14px; }
        .btn-outline:hover { background: var(--row-hover); border-color: var(--text-muted); }
        .btn-outline-primary { background: var(--primary-light); border: 1px solid transparent; color: var(--primary); padding: 6px 12px; border-radius: 8px;}
        .btn-outline-primary:hover { background: var(--primary); color: white; }
        
        /* Dashboard Grid (5 Cards Layout) */
        .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 24px; }
        @media (min-width: 768px) { .dashboard-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .dashboard-grid { grid-template-columns: repeat(5, 1fr); } }
        
        .card { background: var(--card-bg); padding: 18px; border-radius: 16px; box-shadow: var(--shadow); transition: all 0.3s ease; border: 1px solid var(--border); position: relative; overflow: hidden; }
        .card:hover { transform: translateY(-2px); box-shadow: var(--card-hover-shadow); }
        .card h3 { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;}
        .card .value { font-size: 22px; font-weight: 800; color: var(--text-main); letter-spacing: -0.03em; }
        .due-card { border-left: 4px solid var(--danger); }
        .card::after { content: ''; position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-light) 0%, transparent 70%); border-radius: 0 16px 0 60px; pointer-events: none; }

        /* Sections & Native CSS Chart */
        .section-container { background: var(--card-bg); padding: 22px; border-radius: 16px; box-shadow: var(--shadow); margin-bottom: 24px; border: 1px solid var(--border); transition: background 0.3s; }
        .section-title { font-size: 16px; font-weight: 700; margin-bottom: 18px; color: var(--text-main); display: flex; align-items: center; justify-content: space-between; }
        
        .native-chart { display: flex; align-items: flex-end; gap: 12px; height: 210px; padding: 15px 5px 5px 5px; overflow-x: auto; width: 100%; scrollbar-width: thin; }
        .chart-col { flex: 1; min-width: 44px; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative; }
        .chart-val { font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; white-space: nowrap; }
        .chart-bar { width: 100%; background: linear-gradient(to top, var(--primary), #818cf8); border-radius: 6px 6px 0 0; transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.85; }
        .chart-col:hover .chart-bar { opacity: 1; transform: scaleY(1.02); background: linear-gradient(to top, var(--primary-hover), var(--primary)); }
        .chart-label { font-size: 11px; font-weight: 500; color: var(--text-muted); margin-top: 8px; white-space: nowrap; }

        /* Compact Table */
        .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 10px; border: 1px solid var(--border); }
        table { width: 100%; border-collapse: collapse; min-width: 650px; font-size: 14px; text-align: left; }
        th, td { padding: 14px 12px; border-bottom: 1px solid var(--border); }
        th { background: var(--row-hover); color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
        tbody tr { transition: background-color 0.15s ease; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background-color: var(--row-hover); }
        .fw-bold { font-weight: 700; }

        /* Modal Styles */
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: var(--modal-overlay); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .modal-content { background-color: var(--card-bg); color: var(--text-main); margin: 6% auto; padding: 28px; border-radius: 20px; width: 92%; max-width: 480px; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid var(--border); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .close-btn { position: absolute; right: 22px; top: 22px; width: 32px; height: 32px; border-radius: 50%; background: var(--input-bg); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: 0.2s; border: none;}
        .close-btn:hover { background: var(--border); color: var(--text-main); }
        .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        
        /* Form Inside Modal */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 4px; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { display: block; font-size: 12px; margin-bottom: 6px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .form-control { width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; background: var(--input-bg); color: var(--text-main); transition: all 0.2s ease;}
        .form-control:focus { border-color: var(--primary); outline: none; background: var(--card-bg); box-shadow: 0 0 0 3px var(--primary-light); }
        .btn-submit { width: 100%; margin-top: 18px; padding: 12px; font-size: 15px; justify-content: center; }

        /* View Details Data List */
        .detail-row { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid var(--border); font-size: 14px;}
        .detail-row span { color: var(--text-muted); font-weight: 500; }
        .detail-row strong { color: var(--text-main); font-weight: 600; }
        .highlight-due { background: var(--due-bg); padding: 12px; margin-top: 6px; border-radius: 10px; border-bottom: none; border: 1px solid rgba(239, 68, 68, 0.2); }
        .highlight-pay { background: var(--pay-bg); padding: 12px; margin-top: 6px; border-radius: 10px; border-bottom: none; border: 1px solid rgba(16, 185, 129, 0.2); }
        
        /* Floating Action Button (Mobile) */
        .fab { position: fixed; bottom: 24px; right: 24px; width: 58px; height: 58px; background: var(--primary); color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 28px; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); cursor: pointer; z-index: 99; transition: transform 0.2s ease, background-color 0.2s;}
        .fab:hover { transform: scale(1.08); background: var(--primary-hover); }
        @media (min-width: 768px) { .fab { display: none; } } 
        .desktop-add { display: none; }
        @media (min-width: 768px) { .desktop-add { display: inline-flex; } }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <div class="header-brand">
            <div class="header-logo">⚡</div>
            <h2>AC Dashboard</h2>
        </div>
        <div class="header-actions">
            <button id="themeToggle" class="btn btn-outline" onclick="toggleTheme()">
                <span id="themeIcon">🌙</span> <span class="desktop-add">Theme</span>
            </button>
            <button class="btn btn-primary desktop-add" onclick="openModal('formModal')">
                <span>+</span> New Entry
            </button>
        </div>
    </div>

    <!-- Dashboard Cards (5 Cards Layout) -->
    <div class="dashboard-grid">
        <div class="card due-card">
            <h3>Current Total Due</h3>
            <div class="value">₱<?= number_format($currentDue, 2) ?></div>
        </div>
        <div class="card">
            <h3>Latest Bill</h3>
            <div class="value">₱<?= number_format($latestBill, 2) ?></div>
        </div>
        <div class="card">
            <h3>KW / Statement</h3>
            <div class="value"><?= number_format($latestKwStatement, 2) ?> <span style="font-size:13px; font-weight:500; color:var(--text-muted)">kWh</span></div>
        </div>
        <div class="card">
            <h3>Ave Cost / Day</h3>
            <div class="value">₱<?= number_format($latestAveCost, 2) ?></div>
        </div>
        <div class="card">
            <h3>Remaining Balance</h3>
            <div class="value">₱<?= number_format($latestBalance, 2) ?></div>
        </div>
    </div>

    <!-- Native Built-In Offline Chart Section -->
    <div class="section-container">
        <div class="section-title">
            <span>Monthly Statement Trend</span>
            <span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">Last 12 Months</span>
        </div>
        <div class="native-chart">
            <?php 
            $maxVal = !empty($chartData) ? max($chartData) : 1;
            if ($maxVal <= 0) {$maxVal = 1; }
            
            if (!empty($chartLabels)):
                foreach ($chartLabels as $idx =>$label):
                    $val =$chartData[$idx];$heightPct = ($val / $maxVal) * 100;
                    if ($heightPct < 5) {$heightPct = 5; } // Minimum height for visibility
            ?>
            <div class="chart-col" title="<?= htmlspecialchars($label) ?>: <?=$val ?> kWh">
                <span class="chart-val"><?= $val ?></span>
                <div class="chart-bar" style="height: <?= $heightPct ?>%;"></div>
                <span class="chart-label"><?= htmlspecialchars($label) ?></span>
            </div>
            <?php 
                endforeach;
            else:
            ?>
                <div style="width: 100%; text-align: center; color: var(--text-muted); padding: 40px 0;">No records found for chart.</div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Compact Data Table -->
    <div class="section-container">
        <div class="section-title">Historical Records</div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>KW CutOff</th>
                        <th>KW Month</th>
                        <th>Rate/Kwh</th>
                        <th>Bill</th>
                        <th>Total Due</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach(array_reverse($records) as$r): ?>
                    <tr>
                        <td class="fw-bold"><?= date('M Y', strtotime($r['CutoffDate'])) ?></td>
                        <td><?= htmlspecialchars($r['KW_CutOff']) ?></td>
                        <td><?= htmlspecialchars($r['KW_Month']) ?></td>
                        <td><?= htmlspecialchars($r['RatePerKwh']) ?: '<span style="color:var(--text-muted)">—</span>' ?></td>
                        <td>₱<?= number_format((float)$r['Bill'], 2) ?></td>
                        <td class="fw-bold">₱<?= number_format((float)$r['TotalDue'], 2) ?></td>
                        <td>
                            <button class="btn btn-outline-primary" onclick='viewRecord(<?= json_encode($r) ?>)'>View</button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Floating Action Button for Mobile -->
<div class="fab" onclick="openModal('formModal')">+</div>

<!-- FORM MODAL -->
<div id="formModal" class="modal">
    <div class="modal-content">
        <button class="close-btn" onclick="closeModal('formModal')">&times;</button>
        <div class="modal-title" id="form-title">Add New Entry</div>
        
        <form method="POST" id="entryForm">
            <input type="hidden" name="action" value="save">
            <input type="hidden" name="old_date" id="old_date" value="">
            
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Cutoff Date</label>
                    <input type="date" name="CutoffDate" id="CutoffDate" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>KW CutOff</label>
                    <input type="number" step="any" name="KW_CutOff" id="KW_CutOff" class="form-control" required placeholder="0">
                </div>
                <div class="form-group">
                    <label>KW Month</label>
                    <input type="number" step="any" name="KW_Month" id="KW_Month" class="form-control" placeholder="0">
                </div>
                <div class="form-group">
                    <label>Rate Per Kwh</label>
                    <input type="number" step="any" name="RatePerKwh" id="RatePerKwh" class="form-control" placeholder="(auto)">
                </div>
                <div class="form-group">
                    <label>Offset Days</label>
                    <input type="number" step="any" name="OffsetDays" id="OffsetDays" class="form-control" placeholder="0">
                </div>
                <div class="form-group full-width">
                    <label>Payment Made</label>
                    <input type="number" step="any" name="Payment" id="Payment" class="form-control" placeholder="₱0.00">
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-submit">Save Record</button>
        </form>
    </div>
</div>

<!-- DETAILS MODAL -->
<div id="detailsModal" class="modal">
    <div class="modal-content">
        <button class="close-btn" onclick="closeModal('detailsModal')">&times;</button>
        <div class="modal-title" id="details-title">Record Details</div>
        
        <div id="details-content">
            <!-- Injected via JS -->
        </div>
        
        <button class="btn btn-outline-primary btn-submit" id="btn-edit-current" style="margin-top:20px;">Edit This Record</button>
    </div>
</div>

<!-- Scripts -->
<script>
    // --- Theme Toggle Logic ---
    function setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        
        const icon = document.getElementById('themeIcon');
        const text = document.querySelector('#themeToggle .desktop-add');
        
        if (themeName === 'dark') {
            icon.innerText = '☀️';
            if(text) text.innerText = 'Light';
        } else {
            icon.innerText = '🌙';
            if(text) text.innerText = 'Theme';
        }
    }

    function toggleTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }

    // Initialize Theme on load
    (function() {
        if (localStorage.getItem('theme') === 'dark') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    })();

    // --- Modal Control ---
    function openModal(id) { 
        document.getElementById(id).style.display = 'block'; 
        if(id === 'formModal' && document.getElementById('old_date').value === "") {
            document.getElementById('form-title').innerText = "Add New Entry";
        }
    }
    function closeModal(id) { 
        document.getElementById(id).style.display = 'none'; 
        if(id === 'formModal') { document.getElementById('entryForm').reset(); document.getElementById('old_date').value = ''; }
    }

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
            if(event.target.id === 'formModal') document.getElementById('entryForm').reset();
        }
    }

    // --- View Details ---
    let currentEditingData = null;
    function viewRecord(data) {
        currentEditingData = data;
        
        const d = new Date(data.CutoffDate);
        const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        document.getElementById('details-title').innerText = 'Billing Details: ' + monthName;

        const content = `
            <div class="detail-row"><span>Exact Date:</span> <strong>${data.CutoffDate}</strong></div>
            <div class="detail-row"><span>Cycle Days:</span> <strong>${data.CycleDays} Days</strong></div>
            <div class="detail-row"><span>KW CutOff:</span> <strong>${data.KW_CutOff}</strong></div>
            <div class="detail-row"><span>KW Month:</span> <strong>${data.KW_Month}</strong></div>
            <div class="detail-row"><span>Offset Days:</span> <strong>${data.OffsetDays}</strong></div>
            <div class="detail-row"><span>Computed Statement:</span> <strong>${data.KW_Statement} kWh</strong></div>
            <div class="detail-row"><span>Rate Per Kwh:</span> <strong>₱${parseFloat(data.RatePerKwh || 0).toFixed(4)}</strong></div>
            <div class="detail-row"><span>Computed Bill:</span> <strong>₱${parseFloat(data.Bill).toFixed(2)}</strong></div>
            <div class="detail-row"><span>Ave Cost / Day:</span> <strong>₱${parseFloat(data.AveCost_Day).toFixed(2)}</strong></div>
            <div class="detail-row highlight-due">
                <span style="color:var(--danger)">Total Due:</span> <strong>₱${parseFloat(data.TotalDue).toFixed(2)}</strong>
            </div>
            <div class="detail-row highlight-pay">
                <span style="color:var(--success)">Payment Made:</span> <strong>₱${parseFloat(data.Payment).toFixed(2)}</strong>
            </div>
            <div class="detail-row"><span>Remaining Balance:</span> <strong>₱${parseFloat(data.Balance).toFixed(2)}</strong></div>
        `;
        document.getElementById('details-content').innerHTML = content;
        openModal('detailsModal');
    }

    document.getElementById('btn-edit-current').onclick = function() {
        if(currentEditingData) {
            closeModal('detailsModal');
            
            document.getElementById('old_date').value = currentEditingData.CutoffDate;
            document.getElementById('CutoffDate').value = currentEditingData.CutoffDate;
            document.getElementById('KW_CutOff').value = currentEditingData.KW_CutOff;
            document.getElementById('KW_Month').value = currentEditingData.KW_Month;
            document.getElementById('RatePerKwh').value = currentEditingData.RatePerKwh;
            document.getElementById('OffsetDays').value = currentEditingData.OffsetDays;
            document.getElementById('Payment').value = currentEditingData.Payment;
            
            document.getElementById('form-title').innerText = 'Editing Record: ' + currentEditingData.CutoffDate;
            openModal('formModal');
        }
    };
	
	
	// --- Register Service Worker for PWA Installation ---
		if ('serviceWorker' in navigator) {
			window.addEventListener('load', () => {
				navigator.serviceWorker.register('sw.js')
					.then((reg) => console.log('Service Worker registered successfully:', reg.scope))
					.catch((err) => console.log('Service Worker registration failed:', err));
			});
		}
</script>
</body>
</html>