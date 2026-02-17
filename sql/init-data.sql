INSERT INTO User (id, name, email, points, createdAt)
VALUES ('user1','Test User','test@example.com',0,datetime('now'));

INSERT INTO Tag (uid, isClaimed, createdAt, updatedAt)
VALUES ('TEST123', false, datetime('now'), datetime('now'));

INSERT INTO ClaimCode (code, tagId, createdAt)
VALUES ('CLAIM001', (SELECT id FROM Tag WHERE uid='TEST123'), datetime('now'));
