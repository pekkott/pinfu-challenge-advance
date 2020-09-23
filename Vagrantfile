# coding: utf-8
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  
  config.vm.box = "bento/centos-7.4"
  config.vm.box_url = "https://app.vagrantup.com/bento/boxes/centos-7.4"

  $ci_script = "
sudo yum update -y --disablerepo=\* --enablerepo=base,updates ca-certificates
sudo yum install -y epel-release
sudo yum install -y ansible
sudo yum install -y --enablerepo=epel sshpass git
cd pinfu-challenge
cp vagrant/insecure_private_key /home/vagrant/.ssh/id_rsa
cp vagrant/ssh_config /home/vagrant/.ssh/config
chmod -R og-rwx /home/vagrant/.ssh
chown -R vagrant.vagrant /home/vagrant/.ssh
sudo cp vagrant/ansible.cfg /etc/ansible/ansible.cfg
git config core.filemode false
"

  server_configs = [
    {"hostname" => "ci",   "ip" => "192.168.33.70", "port" => 2270, "memory_size" => "1024", "script" => $ci_script,       "run" => "once"},
    {"hostname" => "game", "ip" => "192.168.33.71", "port" => 2271, "memory_size" => "1024", "script" => "",              "run" => ""},
  ]

  server_configs.each do |server_config|
    config.vm.define "#{server_config['hostname']}" do |server|
      server.vm.hostname = server_config['hostname']
      server.vm.box = "bento/centos-7.4"
      server.vm.network :private_network, ip: server_config['ip']
      server.vm.network :forwarded_port, guest: 22, host: server_config['port'], id: "ssh"
      server.vm.provider "virtualbox" do |v|
        v.customize ["modifyvm", :id, "--memory", server_config['memory_size']]
        v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        v.customize ["setextradata", :id, "VBoxInternal/Devices/VMMDev/0/Config/GetHostTimeDisabled", 0]
      end
      server.vm.synced_folder ".", "/home/vagrant/pinfu-challenge", owner: "root", group: "root", :create => true, :mount_options => ['dmode=777','fmode=777']
      unless server_config['script'].empty? then
        server.vm.provision :shell, inline: server_config['script'], run: server_config['run']
      end
      server.ssh.private_key_path = "./vagrant/insecure_private_key"
      server.ssh.insert_key = false
    end
  end
end
