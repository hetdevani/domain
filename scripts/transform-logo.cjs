const fs = require('fs');
const path = require('path');

const svgPath = 'd:/het-node-backend-base/leasePacketPool/frontend/public/logo.svg';
const adaptivePath = 'd:/het-node-backend-base/leasePacketPool/frontend/public/logo-adaptive.svg';
const whitePath = 'd:/het-node-backend-base/leasePacketPool/frontend/public/logo-white.svg';

const content = fs.readFileSync(svgPath, 'utf8');

// Create White Version
const whiteContent = content.replace(/fill=\"#[a-fA-F0-9]{3,6}\"/g, 'fill=\"white\"');
fs.writeFileSync(whitePath, whiteContent);

// Create Adaptive Version
let adaptiveContent = content.replace('width=\"1167\" height=\"187\"', 'width=\"1167\" height=\"187\" class=\"adaptive-logo\"');
// Inject CSS
const styleBlock = `
<style>
  @media (prefers-color-scheme: dark) {
    .adaptive-logo [fill=\"#000000\"] { fill: #FFFFFF !important; }
    .adaptive-logo [fill=\"#EEEEEE\"], 
    .adaptive-logo [fill=\"#F2F2F2\"], 
    .adaptive-logo [fill=\"#F5F5F5\"], 
    .adaptive-logo [fill=\"#F6F6F6\"], 
    .adaptive-logo [fill=\"#F4F4F4\"] { fill: #FFFFFF !important; }
  }
</style>
`;
adaptiveContent = adaptiveContent.replace('<svg ', '<svg ' + styleBlock.trim() + ' ');

fs.writeFileSync(adaptivePath, adaptiveContent);

console.log('Logos generated successfully!');
