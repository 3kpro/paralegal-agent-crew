"""
PPO Agent for SolForge
Proximal Policy Optimization implementation for discrete action composition.
"""
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import List, Tuple, Dict, Any, Optional

class ActorCritic(nn.Module):
    def __init__(self, input_dim: int, action_dim: int, hidden_dim: int = 64):
        super(ActorCritic, self).__init__()
        
        # Shared extractor (optional, can separate)
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        
        # Actor Head (Policy)
        self.actor = nn.Linear(hidden_dim, action_dim)
        
        # Critic Head (Value)
        self.critic = nn.Linear(hidden_dim, 1)
        
        self.activation = nn.Tanh()
        self.softmax = nn.Softmax(dim=-1)
        
    def forward(self, x):
        x = self.activation(self.fc1(x))
        x = self.activation(self.fc2(x))
        
        action_probs = self.softmax(self.actor(x))
        state_value = self.critic(x)
        
        return action_probs, state_value

class PPOAgent:
    """
    PPO Agent utilizing Actor-Critic architecture.
    """
    
    def __init__(
        self, 
        input_dim: int = 10, # depends on feature vector size
        action_dim: int = 3, # HOLD, BUY, SELL
        lr: float = 0.002,
        gamma: float = 0.99,
        eps_clip: float = 0.2,
        k_epochs: int = 4,
        device: str = "cpu"
    ):
        self.gamma = gamma
        self.eps_clip = eps_clip
        self.k_epochs = k_epochs
        
        if device == "cuda" and torch.cuda.is_available():
            self.device = torch.device("cuda")
        else:
            self.device = torch.device("cpu")
            
        self.policy = ActorCritic(input_dim, action_dim).to(self.device)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)
        
        self.policy_old = ActorCritic(input_dim, action_dim).to(self.device)
        self.policy_old.load_state_dict(self.policy.state_dict())
        
        self.MseLoss = nn.MSELoss()
        
        # Memory
        self.states = []
        self.actions = []
        self.logprobs = []
        self.rewards = []
        self.is_terminals = []
        
    def get_action(self, state: np.ndarray) -> Tuple[int, float]:
        """
        Select action for a given state.
        Returns: action_index, log_prob
        """
        with torch.no_grad():
            state_t = torch.FloatTensor(state).to(self.device)
            state_t = state_t.unsqueeze(0) # Batch dim
            
            action_probs, _ = self.policy_old(state_t)
            dist = torch.distributions.Categorical(action_probs)
            
            action = dist.sample()
            action_logprob = dist.log_prob(action)
            
            # Store in local memory for training later
            self.states.append(state)
            self.actions.append(action.item())
            self.logprobs.append(action_logprob.item())
            
            return action.item(), action_logprob.item()

    def store_outcome(self, reward: float, is_terminal: bool):
        """Store the result of the action"""
        self.rewards.append(reward)
        self.is_terminals.append(is_terminal)

    def update(self):
        """
        Update policy parameters using accumulated memory.
        """
        if not self.states:
            return

        # Monte Carlo estimate of state rewards
        rewards = []
        discounted_reward = 0
        for reward, is_terminal in zip(reversed(self.rewards), reversed(self.is_terminals)):
            if is_terminal:
                discounted_reward = 0
            discounted_reward = reward + (self.gamma * discounted_reward)
            rewards.insert(0, discounted_reward)
            
        # Normalizing the rewards
        rewards = torch.tensor(rewards, dtype=torch.float32).to(self.device)
        if len(rewards) > 1:
            rewards = (rewards - rewards.mean()) / (rewards.std() + 1e-7)
        
        # Convert list to tensor
        old_states = torch.tensor(np.array(self.states), dtype=torch.float32).to(self.device)
        old_actions = torch.tensor(self.actions, dtype=torch.float32).to(self.device)
        old_logprobs = torch.tensor(self.logprobs, dtype=torch.float32).to(self.device)
        
        # Optimize policy for K epochs
        for _ in range(self.k_epochs):
            # Evaluating old actions and values
            action_probs, state_values = self.policy(old_states)
            state_values = torch.squeeze(state_values)
            dist = torch.distributions.Categorical(action_probs)
            
            logprobs = dist.log_prob(old_actions)
            dist_entropy = dist.entropy()
            
            # Finding the ratio (pi_theta / pi_theta__old)
            ratios = torch.exp(logprobs - old_logprobs.detach())
            
            # Finding Surrogate Loss
            advantages = rewards - state_values.detach()
            surr1 = ratios * advantages
            surr2 = torch.clamp(ratios, 1-self.eps_clip, 1+self.eps_clip) * advantages
            
            loss = -torch.min(surr1, surr2) + 0.5 * self.MseLoss(state_values, rewards) - 0.01 * dist_entropy
            
            # take gradient step
            self.optimizer.zero_grad()
            loss.mean().backward()
            self.optimizer.step()
            
        # Copy new weights into old policy
        self.policy_old.load_state_dict(self.policy.state_dict())
        
        # Clear memory
        self.states = []
        self.actions = []
        self.logprobs = []
        self.rewards = []
        self.is_terminals = []

    def save(self, checkpoint_path: str):
        torch.save(self.policy.state_dict(), checkpoint_path)
        
    def load(self, checkpoint_path: str):
        self.policy.load_state_dict(torch.load(checkpoint_path, map_location=self.device))
        self.policy_old.load_state_dict(self.policy.state_dict())
