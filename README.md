

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Configuration of AWS instance for production server

### git install
```bash
sudo yum update -y
sudo yum install git -y
git --version
```
### node 18.17.1 install
```bash
sudo yum install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
# and
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
# and
nvm install 18.17.1
nvm use 18.17.1
node --version

```
### github ssh setting
```bash
ssh-keygen -t rsa -b 4096 -C "test@gmail.com"

# When asked for the file in which to save the key, press Enter to accept the default location (/home/ec2-user/.ssh/id_rsa).

eval "$(ssh-agent -s)"

ssh-add ~/.ssh/id_rsa

cat ~/.ssh/id_rsa.pub

# Copy the Output:
# Add the SSH Key to Github - In the left sidebar, click SSH and GPG keys
```
## Run
```bash
npm install
npm run build
npm install -g pm2
pm2 start npm --name "jscore_mvp" -- start
pm2 save
pm2 startup
pm2 status
pm2 stop jscore_mvp
pm2 delete jscore_mvp
pm2 restart jscore_mvp

```

## Add a Rule for Port 3000:

Click on "Add rule".
Set Type to "Custom TCP Rule".
Set Port range to "4000".
Set Source to "Anywhere" (0.0.0.0/0) to allow access from any IP address. If you're only going to access it from specific IP addresses, you can restrict the source accordingly.
Click on "Save rules".

## Associate the Elastic IP Address:

Select the Elastic IP address from the list.
Click on the Actions dropdown menu and select Associate Elastic IP address.
In the Instance field, select your running instance.
Choose the private IP address of the instance if prompted (usually eth0).
Click on Associate to complete the process.


* Make sure to set port
"start": "next start -p 4000",  // Update this line






