export async function getVcenterList() {
  return [
    { id: 'vcenter1', name: 'vCenter Production' },
    { id: 'vcenter2', name: 'vCenter Test' },
  ]
}

export async function getVcenterClusters(vcenterId) {
  return ['Cluster-A', 'Cluster-B', 'Cluster-C', 'Cluster-D']
}

export async function getAllVmsWithClusterInfo(vcenterId) {
  const oses = ['Ubuntu 22.04', 'Windows Server 2019', 'Debian 12', 'CentOS 8', 'RHEL 9']
  const clusters = ['Cluster-A', 'Cluster-B', 'Cluster-C', 'Cluster-D']
  const folders = ['Production', 'Test', 'Development', 'Staging']
  const vms = []
  for (let i = 1; i <= 48; i++) {
    vms.push({
      vm_uid: `vm-${vcenterId}-${i}`,
      name: `vm-${vcenterId}-${String(i).padStart(3, '0')}`,
      os: oses[i % oses.length],
      cpu_count: [2, 4, 8, 16][i % 4],
      memory_size_MiB: [4096, 8192, 16384, 32768][i % 4],
      cluster: clusters[i % clusters.length],
      cluster_name: clusters[i % clusters.length],
      folder_main: folders[i % folders.length],
      storage_gb: [50, 100, 200, 500][i % 4],
      creation_date: new Date(Date.now() - i * 86400000).toISOString(),
    })
  }
  return vms
}

export async function getVmsChangedToday(vcenterId) {
  return ['vm-vcenter1-3', 'vm-vcenter1-7', 'vm-vcenter1-12']
}

export async function getVmsChangedTodayDetails(vcenterId) {
  return [
    { vm_uid: 'vm-vcenter1-3', vm_name: 'vm-vcenter1-003', libelle: 'CPU', old_value: '4', new_value: '8', change_date: new Date().toISOString() },
    { vm_uid: 'vm-vcenter1-7', vm_name: 'vm-vcenter1-007', libelle: 'RAM', old_value: '8 GB', new_value: '16 GB', change_date: new Date().toISOString() },
    { vm_uid: 'vm-vcenter1-12', vm_name: 'vm-vcenter1-012', libelle: 'Stockage', old_value: '100 GB', new_value: '200 GB', change_date: new Date().toISOString() },
  ]
}

export async function getVmHistoryEntries(vcenterId, { startDate, endDate, searchQuery } = {}) {
  const entries = []
  const fields = [
    { libelle: 'CPU', old_value: '2', new_value: '4' },
    { libelle: 'RAM', old_value: '4 GB', new_value: '8 GB' },
    { libelle: 'Stockage', old_value: '50 GB', new_value: '100 GB' },
    { libelle: 'OS', old_value: 'Ubuntu 20.04', new_value: 'Ubuntu 22.04' },
    { libelle: 'Cluster', old_value: 'Cluster-A', new_value: 'Cluster-B' },
  ]
  for (let i = 1; i <= 35; i++) {
    const field = fields[i % fields.length]
    entries.push({
      vm_uid: `vm-${vcenterId}-${i}`,
      vm_name: `vm-${vcenterId}-${String(i).padStart(3, '0')}`,
      libelle: field.libelle,
      old_value: field.old_value,
      new_value: field.new_value,
      change_date: new Date(Date.now() - i * 3600000 * 6).toISOString(),
    })
  }
  return entries
}

export async function getVmStorageBatch(vmIds, vcenterId) {
  const map = {}
  for (const id of vmIds) {
    map[id] = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)]
  }
  return map
}

export async function getVmGuestNetworkingInterfaces(vmId, vcenterId) {
  const seed = vmId.length
  if (seed % 3 === 0) {
    return [{ ip_addresses: ['10.0.0.10', '192.168.1.5'] }]
  }
  if (seed % 3 === 1) {
    return [{ ip_addresses: ['172.16.5.20'] }]
  }
  return [{ ip_addresses: [] }]
}

export function logout() {
  localStorage.removeItem('vcenter_token')
}
