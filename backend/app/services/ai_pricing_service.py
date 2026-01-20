import random

class AIPricingService:
    def predict_price(self, image_path: str) -> int:
        """
        Mock AI price prediction based on image.
        Returns a random price between 100,000 and 1,000,000 KRW.
        """
        # In a real scenario, this would load a model and process the image.
        # For MVP, we return a random price.
        return random.randint(100, 1000) * 1000
