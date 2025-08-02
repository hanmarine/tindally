import os
from flask import Flask
from flask_cors import CORS 
from dotenv import load_dotenv

load_dotenv()
def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'), 
        DATABASE=os.path.join(app.instance_path, 'database.db'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app)

    from . import db
    db.init_app(app)

    from . import routes
    app.register_blueprint(routes.bp)

    return app