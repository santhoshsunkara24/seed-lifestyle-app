/**
 * Utility to calculate total weight based on weight per packet and number of packets.
 * Supports units like g, kg, ml, L (case-insensitive) and formats the output cleanly.
 *
 * @param {string} weightPerPkt - Weight per packet string (e.g., "500g", "1.5 kg", "250")
 * @param {number|string} totalPackets - Number of packets
 * @returns {string} - Formatted total weight (e.g., "5 kg", "15 kg")
 */
export const calculateTotalWeight = (weightPerPkt, totalPackets) => {
    if (!weightPerPkt || !totalPackets) return '';
    const packets = parseFloat(totalPackets);
    if (isNaN(packets) || packets <= 0) return '';

    // Match weight string: optional decimal/integer followed by optional space and letters
    const match = weightPerPkt.trim().match(/^([\d.]+)\s*([a-zA-Z]*)$/);
    if (!match) return '';

    const num = parseFloat(match[1]);
    const unit = match[2] || '';
    if (isNaN(num) || num <= 0) return '';

    const total = num * packets;
    const lowerUnit = unit.toLowerCase();
    
    // Auto convert grams to kg if >= 1000g
    if (lowerUnit === 'g' && total >= 1000) {
        return `${(total / 1000).toFixed(2).replace(/\.00$/, '')} kg`;
    }
    // Auto convert ml to L if >= 1000ml
    if (lowerUnit === 'ml' && total >= 1000) {
        return `${(total / 1000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    
    const formattedTotal = total.toFixed(2).replace(/\.00$/, '');
    return unit ? `${formattedTotal} ${unit}` : formattedTotal;
};
