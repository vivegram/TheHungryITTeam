// Weekly Report functionality
const WEEKLY_REPORT_SHEET = 'Weekly Report';

async function generateWeeklyReport() {
    try {
        // Initialize the Google API client
        await initializeGoogleAPI();
        
        // Get the current week's orders
        const orders = await getCurrentWeekOrders();
        
        // Calculate statistics
        const stats = calculateWeeklyStats(orders);
        
        // Update the weekly report sheet
        await updateWeeklyReportSheet(stats);
        
        // Show success message
        showSuccessMessage('Weekly report generated successfully!');
        
    } catch (error) {
        console.error('Error generating weekly report:', error);
        showErrorMessage('Failed to generate weekly report. Please try again.');
    }
}

async function getCurrentWeekOrders() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // End on Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Orders!A:F',
        valueRenderOption: 'UNFORMATTED_VALUE'
    });
    
    const values = response.result.values || [];
    if (values.length <= 1) return []; // Skip header row
    
    return values.slice(1).filter(row => {
        const orderDate = new Date(row[0]);
        return orderDate >= startOfWeek && orderDate <= endOfWeek;
    });
}

function calculateWeeklyStats(orders) {
    const stats = {
        totalOrders: orders.length,
        totalAmount: 0,
        ordersByRestaurant: {},
        ordersByPerson: {},
        dailyTotals: {},
        averageOrderPrice: 0
    };
    
    orders.forEach(order => {
        const [date, restaurant, name, orderText, price] = order;
        const priceNum = parseFloat(price) || 0;
        
        // Update totals
        stats.totalAmount += priceNum;
        
        // Orders by restaurant
        stats.ordersByRestaurant[restaurant] = (stats.ordersByRestaurant[restaurant] || 0) + 1;
        
        // Orders by person
        stats.ordersByPerson[name] = (stats.ordersByPerson[name] || 0) + 1;
        
        // Daily totals
        stats.dailyTotals[date] = (stats.dailyTotals[date] || 0) + priceNum;
    });
    
    // Calculate average order price
    stats.averageOrderPrice = stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0;
    
    return stats;
}

async function updateWeeklyReportSheet(stats) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (6 - today.getDay()));
    
    const dateRange = `${formatDate(weekStart)} to ${formatDate(weekEnd)}`;
    
    // Prepare the report data
    const reportData = [
        ['Weekly Report', dateRange],
        [],
        ['Summary'],
        ['Total Orders', stats.totalOrders],
        ['Total Amount', `$${stats.totalAmount.toFixed(2)}`],
        ['Average Order Price', `$${stats.averageOrderPrice.toFixed(2)}`],
        [],
        ['Orders by Restaurant'],
        ['Restaurant', 'Number of Orders'],
        ...Object.entries(stats.ordersByRestaurant).map(([restaurant, count]) => [restaurant, count]),
        [],
        ['Orders by Person'],
        ['Person', 'Number of Orders'],
        ...Object.entries(stats.ordersByPerson).map(([person, count]) => [person, count]),
        [],
        ['Daily Totals'],
        ['Date', 'Total Amount'],
        ...Object.entries(stats.dailyTotals).map(([date, amount]) => [date, `$${amount.toFixed(2)}`])
    ];
    
    // Check if the Weekly Report sheet exists
    try {
        await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
    } catch (error) {
        // Create the sheet if it doesn't exist
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: {
                            title: WEEKLY_REPORT_SHEET
                        }
                    }
                }]
            }
        });
    }
    
    // Clear existing content and update with new report
    await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${WEEKLY_REPORT_SHEET}!A1:Z1000`
    });
    
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${WEEKLY_REPORT_SHEET}!A1`,
        valueInputOption: 'RAW',
        resource: {
            values: reportData
        }
    });
    
    // Format the report
    await formatWeeklyReport();
}

async function formatWeeklyReport() {
    const requests = [
        // Title formatting
        {
            repeatCell: {
                range: {
                    sheetId: await getSheetId(WEEKLY_REPORT_SHEET),
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 2
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                        textFormat: {
                            bold: true,
                            fontSize: 14,
                            foregroundColor: { red: 1, green: 1, blue: 1 }
                        },
                        horizontalAlignment: 'CENTER'
                    }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
        },
        // Section headers formatting
        {
            repeatCell: {
                range: {
                    sheetId: await getSheetId(WEEKLY_REPORT_SHEET),
                    startRowIndex: 2,
                    endRowIndex: 3,
                    startColumnIndex: 0,
                    endColumnIndex: 2
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                        textFormat: {
                            bold: true
                        }
                    }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
        },
        // Data formatting
        {
            repeatCell: {
                range: {
                    sheetId: await getSheetId(WEEKLY_REPORT_SHEET),
                    startRowIndex: 3,
                    endRowIndex: 1000,
                    startColumnIndex: 1,
                    endColumnIndex: 2
                },
                cell: {
                    userEnteredFormat: {
                        numberFormat: {
                            type: 'NUMBER',
                            pattern: '#,##0.00'
                        }
                    }
                },
                fields: 'userEnteredFormat(numberFormat)'
            }
        }
    ];
    
    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: { requests }
    });
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

async function getSheetId(sheetName) {
    const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });
    
    const sheet = response.result.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
}

// Add event listener for the generate report button
document.addEventListener('DOMContentLoaded', () => {
    const generateReportButton = document.getElementById('generateReportButton');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', generateWeeklyReport);
    }
}); 