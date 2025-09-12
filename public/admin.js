// ===================================================================================
//
//  ADMIN PANEL SCRIPT FOR DEV-GENESIS 2025
//  Handles all frontend logic, API calls, and UI rendering.
//
// ===================================================================================

// --- GLOBAL VARIABLES & CONSTANTS ---
const API_BASE = '/api';
let allTeams = [];
let deletedTeams = [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDashboardData();
});

// ===================================================================================
//
//  CORE FUNCTIONS
//
// ===================================================================================

/**
 * Sets up all necessary event listeners for the page.
 */
function setupEventListeners() {
    // Main search bar
    document.getElementById('searchInput').addEventListener('input', e => filterTeams(e.target.value));

    // Recycle bin open button
    document.getElementById('recycleBinBtn').addEventListener('click', openRecycleBin);

    // Modal close buttons
    document.getElementById('modalCloseBtn').addEventListener('click', () => document.getElementById('recycleBinModal').style.display = 'none');
    document.getElementById('detailsModalCloseBtn').addEventListener('click', () => document.getElementById('teamDetailsModal').style.display = 'none');

    // Recycle bin search bar
    document.getElementById('recycleBinSearchInput').addEventListener('input', e => filterDeletedTeams(e.target.value));

    // Close modal if clicked outside of it
    window.addEventListener('click', e => {
        if (e.target == document.getElementById('recycleBinModal')) {
            document.getElementById('recycleBinModal').style.display = 'none';
        }
        if (e.target == document.getElementById('teamDetailsModal')) {
            document.getElementById('teamDetailsModal').style.display = 'none';
        }
    });
}

/**
 * Loads initial dashboard data (stats and teams) from the API.
 */
async function loadDashboardData() {
    try {
        showLoading(true);
        const [statsRes, teamsRes] = await Promise.all([
            fetch(`${API_BASE}/stats`),
            fetch(`${API_BASE}/teams`)
        ]);

        const statsData = await statsRes.json();
        const teamsData = await teamsRes.json();

        if (statsData.success) updateStats(statsData.data);
        if (teamsData.success) {
            allTeams = teamsData.data;
            renderTeamsTable(allTeams);
        } else {
            showMessage('Could not load teams.', 'error');
        }
        showMessage('Dashboard loaded successfully!', 'success');
    } catch (error) {
        showMessage('Failed to load dashboard data.', 'error');
    } finally {
        showLoading(false);
    }
}

// ===================================================================================
//
//  UI RENDERING FUNCTIONS
//
// ===================================================================================

/**
 * Updates the statistics cards with new data.
 * @param {object} data - The statistics data.
 */
function updateStats(data) {
    document.getElementById('totalTeams').textContent = data.totalTeams || 0;
    document.getElementById('totalParticipants').textContent = data.totalParticipants || 0;
    document.getElementById('totalDomains').textContent = data.domainDistribution?.length || 0;
    const avgSize = data.totalTeams > 0 ? (data.totalParticipants / data.totalTeams).toFixed(1) : 0;
    document.getElementById('avgTeamSize').textContent = avgSize;
}

/**
 * Renders the main table of registered teams.
 * @param {Array} teams - An array of team objects.
 */
function renderTeamsTable(teams) {
    const tbody = document.getElementById('teamsTableBody');
    tbody.innerHTML = '';

    if (teams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No teams registered yet</td></tr>';
        return;
    }

    teams.forEach(team => {
        const row = document.createElement('tr');
        row.ondblclick = () => showTeamDetails(team.id);
        row.innerHTML = `
            <td><strong>${escapeHtml(team.team_name)}</strong></td>
            <td><span class="domain-badge">${escapeHtml(team.selected_domain)}</span></td>
            <td>${team.member_count}</td>
            <td><div>${escapeHtml(team.contact_email)}</div><small style="color:var(--text-secondary);">${escapeHtml(team.contact_phone)}</small></td>
            <td>${team.institution ? escapeHtml(team.institution) : '-'}</td>
            <td>${new Date(team.created_at).toLocaleDateString()}</td>
            <td class="actions-cell">
                <button class="btn-action btn-remove" onclick="event.stopPropagation(); removeTeam(${team.id})">Remove</button>
                <button class="btn-action btn-delete-perm" onclick="event.stopPropagation(); deleteTeamPermanentlyFromMain(${team.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Renders the table of deleted teams in the recycle bin modal.
 * @param {Array} teams - An array of deleted team objects.
 */
function renderDeletedTeams(teams) {
    const tbody = document.getElementById('deletedTeamsTableBody');
    tbody.innerHTML = '';

    if (teams.length > 0) {
        teams.forEach(team => {
            tbody.innerHTML += `
                <tr>
                    <td>${escapeHtml(team.team_name)}</td>
                    <td>${escapeHtml(team.contact_email)}</td>
                    <td class="actions-cell">
                        <button class="btn-action btn-restore" onclick="restoreTeam(${team.id})">Restore</button>
                        <button class="btn-action btn-delete-perm" onclick="deleteTeamPermanentlyFromBin(${team.id})">Delete</button>
                    </td>
                </tr>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Recycle bin is empty.</td></tr>';
    }
}

// ===================================================================================
//
//  EVENT HANDLER & ACTION FUNCTIONS
//
// ===================================================================================

/**
 * Fetches and displays details of a specific team's members in a modal.
 * @param {number} teamId - The ID of the team.
 */
async function showTeamDetails(teamId) {
    try {
        const response = await fetch(`${API_BASE}/teams/${teamId}/members`);
        const result = await response.json();
        const contentDiv = document.getElementById('teamDetailsContent');
        contentDiv.innerHTML = '';

        if (result.success && result.data.length > 0) {
            let tableHTML = '<table class="teams-table"><thead><tr><th>Role</th><th>Name</th><th>Email</th><th>Mobile No.</th></tr></thead><tbody>';
            result.data.forEach(member => {
                tableHTML += `<tr>
                    <td>${escapeHtml(member.role)}</td>
                    <td>${escapeHtml(member.member_name)}</td>
                    <td>${escapeHtml(member.member_email)}</td>
                    <td>${escapeHtml(member.member_phone) || 'N/A'}</td>
                </tr>`;
            });
            tableHTML += '</tbody></table>';
            contentDiv.innerHTML = tableHTML;
        } else {
            contentDiv.innerHTML = '<p>No member details found.</p>';
        }
        document.getElementById('teamDetailsModal').style.display = 'flex';
    } catch (error) {
        showMessage('Failed to fetch team details.', 'error');
    }
}

/**
 * Filters the main teams table based on a search term.
 * @param {string} searchTerm - The text to search for.
 */
function filterTeams(searchTerm) {
    const filtered = allTeams.filter(team =>
        Object.values(team).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    renderTeamsTable(filtered);
}

/**
 * Filters the deleted teams in the recycle bin based on a search term.
 * @param {string} searchTerm - The text to search for.
 */
function filterDeletedTeams(searchTerm) {
    const filtered = deletedTeams.filter(team =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderDeletedTeams(filtered);
}

/**
 * Reloads all dashboard data.
 */
function refreshData() {
    loadDashboardData();
}

/**
 * Opens the recycle bin modal and fetches the list of deleted teams.
 */
async function openRecycleBin() {
    try {
        const res = await fetch(`${API_BASE}/teams/deleted`);
        const result = await res.json();
        deletedTeams = result.data || [];
        renderDeletedTeams(deletedTeams);
        document.getElementById('recycleBinModal').style.display = 'flex';
    } catch (e) {
        showMessage('Could not load recycle bin.', 'error');
    }
}

// ===================================================================================
//
//  API INTERACTION FUNCTIONS (DELETE, RESTORE, ETC.)
//
// ===================================================================================

async function removeTeam(teamId) {
    if (confirm('Move this team to the recycle bin?')) {
        try {
            await fetch(`${API_BASE}/teams/${teamId}`, { method: 'DELETE' });
            showMessage('Team moved to recycle bin.', 'success');
            loadDashboardData();
        } catch (e) {
            showMessage('Failed to remove team.', 'error');
        }
    }
}

async function restoreTeam(teamId) {
    if (confirm('Restore this team?')) {
        try {
            await fetch(`${API_BASE}/teams/${teamId}/restore`, { method: 'POST' });
            showMessage('Team restored.', 'success');
            await openRecycleBin();
            if (document.getElementById('deletedTeamsTableBody').rows.length === 0) {
                document.getElementById('recycleBinModal').style.display = 'none';
            }
            loadDashboardData();
        } catch (e) {
            showMessage('Failed to restore team.', 'error');
        }
    }
}

async function deleteTeamPermanentlyFromBin(teamId) {
    if (confirm('DANGER! This will permanently delete the team. Are you sure?')) {
        try {
            await fetch(`${API_BASE}/teams/${teamId}/permanent`, { method: 'DELETE' });
            showMessage('Team permanently deleted.', 'success');
            await openRecycleBin();
            if (document.getElementById('deletedTeamsTableBody').rows.length === 0) {
                document.getElementById('recycleBinModal').style.display = 'none';
            }
        } catch (e) {
            showMessage('Failed to permanently delete team.', 'error');
        }
    }
}

async function deleteTeamPermanentlyFromMain(teamId) {
    if (confirm('DANGER! This will permanently delete the team and it will NOT go to the recycle bin. Are you sure?')) {
        try {
            await fetch(`${API_BASE}/teams/${teamId}/permanent`, { method: 'DELETE' });
            showMessage('Team permanently deleted.', 'success');
            loadDashboardData();
        } catch (e) {
            showMessage('Failed to permanently delete team.', 'error');
        }
    }
}

// ===================================================================================
//
//  UTILITY FUNCTIONS
//
// ===================================================================================

function showLoading(show) {
    document.getElementById('loadingArea').style.display = show ? 'block' : 'none';
}

function showMessage(message, type) {
    const el = document.getElementById('messageArea');
    el.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 5000);
}

function escapeHtml(text) {
    return text?.toString().replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]) || '';
}

function exportData() {
    if (allTeams.length === 0) return showMessage('No data to export', 'error');
    const headers = ['Team Name', 'Domain', 'Members', 'Contact Email', 'Phone', 'Institution', 'Registered Date'];
    const rows = allTeams.map(t => [t.team_name, t.selected_domain, t.member_count, t.contact_email, t.contact_phone || '', t.institution || '', new Date(t.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'hackathon_teams.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
