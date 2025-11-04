document.addEventListener('DOMContentLoaded', () => {
    // --- ส่วนของกราฟราคาและเหตุการณ์ ---
    const priceChartCanvas = document.getElementById('priceChart');
    const symbolSelect = document.getElementById('symbol-select');
    const timeframeSelect = document.getElementById('timeframe-select');
    const loadGraphBtn = document.getElementById('load-graph-btn');
    const eventDetailsDiv = document.getElementById('event-details');
    const eventDescriptionP = document.getElementById('event-description');

    let priceChart; // Global variable for Chart.js instance

    // Mock Data for demonstration
    const mockData = {
        'BTC': {
            '1m': {
                labels: ['Nov 1', 'Nov 5', 'Nov 10', 'Nov 15', 'Nov 20', 'Nov 25', 'Nov 30'],
                prices: [34000, 34500, 36000, 35500, 37000, 36500, 38000],
                events: [
                    { date: 'Nov 10', description: 'ข่าวดี: การอนุมัติ ETF (Mock Event)' },
                    { date: 'Nov 20', description: 'ข่าวลือ: การเปลี่ยนแปลงกฎหมาย (Mock Event)' }
                ]
            },
            '3m': { /* ... data for 3 months ... */ },
            '1y': { /* ... data for 1 year ... */ }
        },
        'ETH': {
            '1m': {
                labels: ['Nov 1', 'Nov 5', 'Nov 10', 'Nov 15', 'Nov 20', 'Nov 25', 'Nov 30'],
                prices: [1800, 1820, 1900, 1880, 1950, 1920, 2000],
                events: [
                    { date: 'Nov 15', description: 'การอัปเกรดเครือข่ายย่อย (Mock Event)' }
                ]
            },
            '3m': { /* ... data for 3 months ... */ },
            '1y': { /* ... data for 1 year ... */ }
        }
    };

    function createPriceChart(symbol, timeframe) {
        if (priceChart) {
            priceChart.destroy(); // ทำลายกราฟเก่าก่อนสร้างใหม่
        }

        const data = mockData[symbol][timeframe];
        if (!data) {
            console.error('No data available for selected symbol and timeframe.');
            return;
        }

        const ctx = priceChartCanvas.getContext('2d');
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `ราคา ${symbol}`,
                    data: data.prices,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'ราคา (USD)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'วันที่'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                let label = `ราคา: ${context.raw}`;
                                const event = data.events.find(e => e.date === context.label);
                                if (event) {
                                    label += `\nเหตุการณ์: ${event.description}`;
                                }
                                return label;
                            }
                        }
                    },
                    // เพิ่มปลั๊กอินสำหรับแสดงเหตุการณ์บนกราฟ (อาจต้องใช้ custom plugin หรือ annotation plugin)
                    // For simplicity, we'll use a basic approach or display in tooltip/separate div
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = priceChart.data.labels[index];
                        const event = data.events.find(e => e.date === label);
                        if (event) {
                            eventDescriptionP.textContent = event.description;
                            eventDetailsDiv.classList.remove('hidden');
                        } else {
                            eventDetailsDiv.classList.add('hidden');
                        }
                    } else {
                        eventDetailsDiv.classList.add('hidden');
                    }
                }
            }
        });
    }

    loadGraphBtn.addEventListener('click', () => {
        const selectedSymbol = symbolSelect.value;
        const selectedTimeframe = timeframeSelect.value;
        createPriceChart(selectedSymbol, selectedTimeframe);
    });

    // โหลดกราฟเริ่มต้นเมื่อหน้าเว็บโหลดเสร็จ
    createPriceChart(symbolSelect.value, timeframeSelect.value);

    // --- ส่วนของ DOM Visualization & Analysis ---
    const analyzeDomBtn = document.getElementById('analyze-dom-btn');
    const domTreeView = document.getElementById('dom-tree-view');
    const domSummary = document.getElementById('dom-summary');
    const domInsights = document.getElementById('dom-insights');
    const urlInput = document.getElementById('url-input');

    analyzeDomBtn.addEventListener('click', () => {
        const targetUrl = urlInput.value.trim();
        // สำหรับ Mockup เราจะวิเคราะห์ DOM ของหน้าปัจจุบัน
        // หากต้องการวิเคราะห์ URL อื่นๆ จะต้องใช้ Proxy/CORS หรือเรียกผ่าน Backend
        if (targetUrl && targetUrl !== window.location.href) {
            alert('การวิเคราะห์ DOM ของ URL ภายนอกต้องใช้ CORS Proxy หรือ Backend ในโปรดักชั่น. สำหรับตอนนี้จะวิเคราะห์ DOM ของหน้านี้แทน');
            // TODO: Implement fetching and parsing external DOM if needed in a real app
        }
        
        // วิเคราะห์ DOM ของหน้าปัจจุบัน
        visualizeAndAnalyzeDOM(document.documentElement); 
    });

    function visualizeAndAnalyzeDOM(node, indent = 0) {
        domTreeView.innerHTML = ''; // Clear previous visualization
        domInsights.innerHTML = ''; // Clear previous insights

        let totalElements = 0;
        let textNodesCount = 0;
        const elementCountByType = {};
        let maxDepth = 0;

        function traverseAndVisualize(currentNode, currentDepth) {
            maxDepth = Math.max(maxDepth, currentDepth);

            const nodeElement = document.createElement('div');
            nodeElement.classList.add('tree-node');
            
            let labelText = '';
            let labelClass = '';

            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                totalElements++;
                const tagName = currentNode.tagName.toLowerCase();
                elementCountByType[tagName] = (elementCountByType[tagName] || 0) + 1;
                labelText = `<${tagName}>`;
                if (currentNode.id) labelText += ` id="${currentNode.id}"`;
                if (currentNode.className) labelText += ` class="${currentNode.className.split(' ')[0]}..."`;
                labelClass = 'element';
            } else if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent.trim() !== '') {
                textNodesCount++;
                labelText = `"${currentNode.textContent.trim().substring(0, 30)}..."`;
                labelClass = 'text';
            } else {
                // Ignore other node types for this visualization
                return;
            }

            const labelDiv = document.createElement('span');
            labelDiv.classList.add('tree-node-label', labelClass);
            labelDiv.innerHTML = labelText;
            nodeElement.appendChild(labelDiv);
            
            // Append to the correct parent in the visualization
            const parentDiv = (currentNode === node) ? domTreeView : domTreeView.querySelector(`.tree-node[data-node-id="${currentNode.parentNode.nodeId}"]`);
            if (parentDiv) {
                 parentDiv.appendChild(nodeElement);
            } else {
                domTreeView.appendChild(nodeElement); // For the root element
            }

            // Assign a unique ID to the node element for parent-child relationship in visualization
            currentNode.nodeId = Math.random().toString(36).substring(2, 9);
            nodeElement.setAttribute('data-node-id', currentNode.nodeId);


            for (let i = 0; i < currentNode.children.length; i++) {
                traverseAndVisualize(currentNode.children[i], currentDepth + 1);
            }
        }

        traverseAndVisualize(node, 0); // Start with the root element (document.documentElement)


        // Display analysis results
        domSummary.innerHTML = `ตรวจพบ ${totalElements} Element และ ${textNodesCount} Text Node โดยมีความลึกสูงสุดของ DOM Tree คือ ${maxDepth} ระดับ`;

        const insights = [
            `จำนวน Element ทั้งหมด: ${totalElements}`,
            `จำนวน Text Node ทั้งหมด: ${textNodesCount}`,
            `ความลึกสูงสุดของ DOM Tree: ${maxDepth} ระดับ`,
            `Element ที่ใช้บ่อยที่สุด: ${Object.entries(elementCountByType).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag, count]) => `${tag} (${count})`).join(', ') || 'ไม่มีข้อมูล'}`,
            `ความหนาแน่นของ ID/Class: ${totalElements > 0 ? ((document.querySelectorAll('[id]').length + document.querySelectorAll('[class]').length) / totalElements * 100).toFixed(2) : 0}% ของ Element มี ID หรือ Class`
        ];

        insights.forEach(insight => {
            const li = document.createElement('li');
            li.textContent = insight;
            domInsights.appendChild(li);
        });
    }

    // เรียกวิเคราะห์ DOM ของหน้าปัจจุบันเมื่อโหลดเสร็จ
    visualizeAndAnalyzeDOM(document.documentElement);

    // Initial image generation (placeholder for your actual logic)
    // You can replace this with an actual image generation based on initial state if desired.
    // For example, an image of an abstract data visualization or a stock chart.
    // Make sure the image generation logic is robust and follows your Depiction Protocol.
    // In this context, I'll generate a generic image to fulfill the example.
    
});
